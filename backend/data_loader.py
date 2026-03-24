import pandas as pd
import re
import math
from typing import Dict, List, Tuple
from pathlib import Path

# Conversion rates to milliliters (ml)
UNIT_CONVERSIONS = {
    'oz': 30.0,
    'ounce': 30.0,
    'ounces': 30.0,
    'cl': 10.0,
    'ml': 1.0,
    'dash': 1.0, # Approximate
    'dashes': 1.0,
    'drop': 0.05,
    'drops': 0.05,
    'splash': 5.0,
    'splashes': 5.0,
    'tsp': 5.0,
    'teaspoon': 5.0,
    'bsp': 5.0,
    'barspoon': 5.0,
    'tbsp': 15.0,
    'tablespoon': 15.0,
    'part': 30.0, # Assume 1 part = 1 oz
    'parts': 30.0,
    'shot': 45.0,
    'shots': 45.0,
    'cup': 240.0,
    'cups': 240.0,
    'pint': 473.0,
}

# Ingredient categories
CATEGORIES = {
    'BASE': [
        'vodka', 'gin', 'rum', 'tequila', 'mezcal', 'whiskey', 'bourbon', 'rye', 
        'scotch', 'brandy', 'cognac', 'pisco', 'cachaça', 'aquavit', 'moonshine', 'absinthe'
    ],
    'MODIFIER': [
        'vermouth', 'lillet', 'chartreuse', 'campari', 'aperol', 'amaro', 'liqueur', 
        'cointreau', 'triple sec', 'st-germain', 'luxardo', 'maraschino', 'cynar',
        'fernet', 'suze', 'pimm', 'schnapps', 'galliano', 'midori', 'curacao', 'kahlua',
        'baileys', 'drambuie', 'benedictine', 'amaretto', 'frangelico', 'creme', 'picon',
        'sherry', 'port', 'madeira', 'sake', 'soju'
    ],
    'ACID': [
        'lemon', 'lime', 'grapefruit', 'yuzu', 'acid', 'citric', 'malic'
    ],
    'SWEETENER': [
        'syrup', 'sugar', 'agave', 'honey', 'grenadine', 'orgeat', 'falernum', 'cordial',
        'nectar', 'maple', 'gomme', 'caramel'
    ],
    'SODA': [
        'soda', 'water', 'sparkling', 'tonic', 'cola', 'ginger ale', 'ginger beer', 
        'champagne', 'prosecco', 'cava', 'sprite', '7up', 'club soda', 'seltzer'
    ]
}

def parse_fraction(val_str: str) -> float:
    try:
        val_str = val_str.strip()
        if not val_str:
            return 0.0
        
        # Handle "1 1/2" format
        if ' ' in val_str and '/' in val_str:
            parts = val_str.split(' ')
            whole = float(parts[0])
            frac_parts = parts[1].split('/')
            frac = float(frac_parts[0]) / float(frac_parts[1])
            return whole + frac
            
        # Handle "1/2" format
        elif '/' in val_str:
            frac_parts = val_str.split('/')
            return float(frac_parts[0]) / float(frac_parts[1])
            
        # Handle "1-2" format (take average)
        elif '-' in val_str:
            parts = val_str.split('-')
            return (float(parts[0]) + float(parts[1])) / 2.0
            
        # Handle normal float
        else:
            return float(val_str)
    except:
        return 0.0

def categorize_ingredient(ingredient_name: str) -> str:
    name_lower = ingredient_name.lower()
    for cat, keywords in CATEGORIES.items():
        if any(keyword in name_lower for keyword in keywords):
            return cat
    return 'OTHER'

def parse_ingredient_measure(ingredient_name: str, measure_str: str) -> Dict:
    """
    Parses a separate measure & ingredient string into standard format
    """
    if pd.isna(ingredient_name) or not str(ingredient_name).strip():
        return None
        
    name_str = str(ingredient_name).strip()
    measure_str = str(measure_str).strip() if pd.notna(measure_str) else ""
    
    # Simple regex to extract amount and unit from measure
    pattern = r"^([\d\.\/\-\s]+)\s+([a-zA-Z]+)?\s*(.*)$"
    match = re.search(pattern, measure_str)
    
    if match:
        amount_str = match.group(1).strip()
        unit_str = (match.group(2) or "").strip().lower()
        extra_unit = match.group(3).strip()
        if unit_str == "" and extra_unit != "":
             unit_str = extra_unit.lower()
    else:
        # Check if measure is just digits
        digits = re.findall(r"^[\d\.\/\-\s]+$", measure_str)
        if digits:
            amount_str = digits[0].strip()
            unit_str = ""
        else:
            # Maybe measure is just "dash" or something without number
            amount_str = "1"
            unit_str = measure_str.lower()

    amount = parse_fraction(amount_str)
    
    # special handling if amount is 0 but measure text implies units
    if amount == 0.0 and len(unit_str) > 0:
        amount = 1.0 # assume at least 1 of whatever unit
        
    ml_volume = 0.0
    
    # Try finding typical unit inside measure string just to be sure
    found_unit = None
    for u in sorted(UNIT_CONVERSIONS.keys(), key=len, reverse=True):
        if u in measure_str.lower():
            found_unit = u
            break
            
    chosen_unit = found_unit if found_unit else unit_str
    
    if chosen_unit in UNIT_CONVERSIONS:
        ml_volume = amount * UNIT_CONVERSIONS[chosen_unit]
    elif amount > 0:
        # e.g., "1 Lemon"
        cat = categorize_ingredient(name_str)
        if cat == 'ACID':
            ml_volume = amount * 30.0 
        elif cat == 'SWEETENER':
            ml_volume = amount * 5.0
            
    return {
        'original_measure': measure_str,
        'name': name_str,
        'amount': amount,
        'unit': chosen_unit,
        'ml': ml_volume,
        'category': categorize_ingredient(name_str)
    }

def load_and_standardize_data(metadata_path: str, recipe_path: str) -> pd.DataFrame:
    meta_df = pd.read_csv(metadata_path)
    recipe_df = pd.read_csv(recipe_path)
    
    # Combine tags for each cocktail in metadata
    tags_df = meta_df.groupby('cocktail_name')['tag_name'].apply(lambda x: [t for t in x if pd.notna(t)]).reset_index()
    tags_df.rename(columns={'tag_name': 'Tags'}, inplace=True)
    
    # Also get first alcoholic/glass per cocktail
    meta_unique = meta_df.drop_duplicates(subset=['cocktail_name'])[['cocktail_name', 'alcoholic', 'glass_type']]
    meta_grouped = pd.merge(meta_unique, tags_df, on='cocktail_name')
    
    # Join with recipe data
    df = pd.merge(meta_grouped, recipe_df, left_on='cocktail_name', right_on='strDrink')
    
    standardized_recipes = []
    
    for idx, row in df.iterrows():
        parsed_ingredients = []
        for i in range(1, 16):
            ing_col = f'strIngredient{i}'
            mea_col = f'strMeasure{i}'
            
            if ing_col in row and pd.notna(row[ing_col]) and str(row[ing_col]).strip():
                measure = row[mea_col] if mea_col in row else ""
                parsed = parse_ingredient_measure(row[ing_col], measure)
                if parsed:
                    parsed_ingredients.append(parsed)
                    
        # Determine method
        prep = str(row.get('strInstructions', '')).lower()
        method = 'Stirred' # Default
        if 'shake' in prep:
            method = 'Shaken'
        elif any(ing['category'] in ['ACID', 'SWEETENER'] for ing in parsed_ingredients):
            method = 'Shaken'
            
        record = {
            'Cocktail Name': row['cocktail_name'],
            'Tags': row['Tags'],
            'Alcoholic': row.get('alcoholic', ''),
            'Glass': row.get('glass_type', ''),
            'Instructions': row.get('strInstructions', ''),
            'Method': method,
            'Parsed_Ingredients': parsed_ingredients
        }
        standardized_recipes.append(record)
        
    return pd.DataFrame(standardized_recipes)

if __name__ == "__main__":
    base_dir = Path("/Users/rajithsingh/Desktop/COCKTAIL GENERATION WITH GA/Data/raw")
    df = load_and_standardize_data(base_dir / "Cocktail metadata.csv", base_dir / "Recipe details.csv")
    print(f"Loaded {len(df)} cocktail recipes.")
    
    if len(df) > 0:
        sample = df.iloc[0]
        print(f"\nSample Cocktail: {sample['Cocktail Name']}")
        print(f"Tags: {sample['Tags']}")
        print(f"Method: {sample['Method']}")
        print("Ingredients:")
        for ing in sample['Parsed_Ingredients']:
            print(f"  - {ing['name']} | Measure: {ing['original_measure']} -> Amount: {ing['amount']} {ing['unit']} -> {ing['ml']} ml [{ing['category']}]")
