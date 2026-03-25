import numpy as pd
import random
import copy
import numpy as np
from typing import List, Dict, Tuple
from sentence_transformers import SentenceTransformer, util
import scipy.spatial.distance as distance

# Load sentence transformer model silently
model = SentenceTransformer('all-MiniLM-L6-v2')

class EvolutionaryMixology:
    def __init__(self, dataset_path: str = None, df = None):
        if df is not None:
            self.df = df
        else:
            self.df = pd.DataFrame()
            
        self.ingredient_pool = {
            'BASE': [], 'MODIFIER': [], 'ACID': [], 'SWEETENER': [], 'SODA': [], 'OTHER': []
        }
        self.populate_ingredient_pool()
        
    def populate_ingredient_pool(self):
        if self.df.empty:
            return
            
        for _, row in self.df.iterrows():
            if 'Parsed_Ingredients' not in row:
                continue
            for ing in row['Parsed_Ingredients']:
                cat = ing.get('category', 'OTHER')
                name = ing.get('name')
                if name and name not in self.ingredient_pool[cat]:
                    self.ingredient_pool[cat].append(name)

    def calculate_vibe_similarity(self, target_vibe: str, recipe_tags: List[str]) -> float:
        if not recipe_tags:
            return 0.0
        tag_str = " ".join(recipe_tags)
        target_emb = model.encode(target_vibe, convert_to_tensor=True)
        recipe_emb = model.encode(tag_str, convert_to_tensor=True)
        cosine_sim = util.pytorch_cos_sim(target_emb, recipe_emb).item()
        mapped_sim = (cosine_sim + 1) / 2.0
        return max(0.0, mapped_sim)

    def evaluate_structural_balance(self, ingredients: List[Dict]) -> float:
        total_ml = sum(ing['ml'] for ing in ingredients)
        volume_score = 1.0
        if total_ml < 90:
            volume_score = max(0.0, 1.0 - (90 - total_ml) / 90.0)
        elif total_ml > 250:
            volume_score = max(0.0, 1.0 - (total_ml - 250) / 100.0)
            
        acid_ml = sum(ing['ml'] for ing in ingredients if ing['category'] == 'ACID')
        sweet_ml = sum(ing['ml'] for ing in ingredients if ing['category'] == 'SWEETENER')
        
        balance_score = 1.0
        if acid_ml > 0 and sweet_ml > 0:
            ratio = acid_ml / sweet_ml
            if ratio < 0.8:
                balance_score = ratio / 0.8
            elif ratio > 1.2:
                balance_score = 1.2 / ratio
        elif acid_ml > 0 and sweet_ml == 0:
            balance_score = 0.5
        elif sweet_ml > 0 and acid_ml == 0:
            balance_score = 0.5
            
        return (volume_score * 0.5) + (balance_score * 0.5)

    def calculate_novelty(self, ingredients: List[Dict]) -> float:
        if self.df.empty:
            return 1.0
        ing_set = set(ing['name'] for ing in ingredients)
        sample_df = self.df.sample(min(50, len(self.df)))
        
        max_jaccard_sim = 0.0
        for _, row in sample_df.iterrows():
            if 'Parsed_Ingredients' not in row:
                continue
            exist_set = set(i['name'] for i in row['Parsed_Ingredients'])
            if not exist_set:
                continue
            intersection = len(ing_set.intersection(exist_set))
            union = len(ing_set.union(exist_set))
            sim = intersection / union if union > 0 else 0
            if sim > max_jaccard_sim:
                max_jaccard_sim = sim
        return 1.0 - max_jaccard_sim

    def generate_random_genome(self, target_vibe: str, genome_id: str = "seed") -> Dict:
        seed_recipe = self.df.sample(1).iloc[0]
        while 'Parsed_Ingredients' not in seed_recipe or len(seed_recipe['Parsed_Ingredients']) == 0:
            seed_recipe = self.df.sample(1).iloc[0]
        genome = copy.deepcopy(seed_recipe.to_dict())
        genome['Method'] = random.choice(['Shaken', 'Stirred'])
        genome['id'] = genome_id
        genome['parents'] = []
        return genome

    def evaluate_fitness(self, genome: Dict, target_vibe: str) -> float:
        ingredients = genome.get('Parsed_Ingredients', [])
        vibe_str_list = [ing['name'] for ing in ingredients] + [genome.get('Method', '')]
        vibe_score = self.calculate_vibe_similarity(target_vibe, vibe_str_list)
        struct_score = self.evaluate_structural_balance(ingredients)
        novelty_score = self.calculate_novelty(ingredients)
        
        total_fitness = (vibe_score * 0.4) + (struct_score * 0.4) + (novelty_score * 0.2)
        genome['fitness'] = total_fitness
        genome['fitness_components'] = {
            'vibe': vibe_score,
            'structure': struct_score,
            'novelty': novelty_score
        }
        return total_fitness

    def mutate(self, genome: Dict, mutation_rate: float = 0.2, log: List[str] = None) -> Dict:
        new_genome = copy.deepcopy(genome)
        ingredients = new_genome.get('Parsed_Ingredients', [])
        
        for ing in ingredients:
            if random.random() < mutation_rate:
                creep = random.uniform(-15.0, 15.0)
                new_ml = max(5.0, ing['ml'] + creep)
                if log is not None:
                    log.append(f"  -> Mutation [Volume Creep]: Changed {ing['name']} from {ing['ml']}ml to {round(new_ml, 1)}ml")
                ing['ml'] = round(new_ml, 1)
                
        for i, ing in enumerate(ingredients):
            if random.random() < (mutation_rate * 0.5):
                cat = ing['category']
                if cat in self.ingredient_pool and self.ingredient_pool[cat]:
                    swap_in = random.choice(self.ingredient_pool[cat])
                    if log is not None:
                        log.append(f"  -> Mutation [Ingredient Swap]: Replaced {ing['name']} with {swap_in} ({cat})")
                    ingredients[i]['name'] = swap_in
                    
        if random.random() < (mutation_rate * 0.2) and self.ingredient_pool['MODIFIER']:
            new_name = random.choice(self.ingredient_pool['MODIFIER'])
            new_ml = random.choice([5.0, 10.0, 15.0])
            new_ing = {
                'name': new_name,
                'category': 'MODIFIER',
                'ml': new_ml,
                'unit': 'ml',
                'amount': 1
            }
            if log is not None:
                log.append(f"  -> Mutation [Insertion]: Added {new_ml}ml of {new_name} (MODIFIER)")
            ingredients.append(new_ing)
            
        new_genome['Parsed_Ingredients'] = ingredients
        return new_genome

    def crossover(self, parent1: Dict, parent2: Dict, gen: int, idx: int, log: List[str] = None) -> Tuple[Dict, Dict]:
        child1 = copy.deepcopy(parent1)
        child2 = copy.deepcopy(parent2)
        
        child1['id'] = f"g{gen}_i{idx}"
        child2['id'] = f"g{gen}_i{idx+1}"
        child1['parents'] = [parent1['id'], parent2['id']]
        child2['parents'] = [parent1['id'], parent2['id']]

        b1 = [i for i in child1['Parsed_Ingredients'] if i['category'] == 'BASE']
        b2 = [i for i in child2['Parsed_Ingredients'] if i['category'] == 'BASE']
        nb1 = [i for i in child1['Parsed_Ingredients'] if i['category'] != 'BASE']
        nb2 = [i for i in child2['Parsed_Ingredients'] if i['category'] != 'BASE']
        
        if random.random() < 0.5:
            if log is not None:
                log.append(f"  -> Crossover: Swapped non-base ingredients while preserving base pattern.")
            child1['Parsed_Ingredients'] = b1 + copy.deepcopy(nb2)
            child2['Parsed_Ingredients'] = b2 + copy.deepcopy(nb1)
        else:
            if log is not None:
                log.append(f"  -> Crossover: Swapped base spirits between genomes.")
            child1['Parsed_Ingredients'] = copy.deepcopy(b2) + nb1
            child2['Parsed_Ingredients'] = copy.deepcopy(b1) + nb2
            
        return child1, child2

    def evolve(self, target_vibe: str, generations: int = 20, pop_size: int = 50, elitism_pct: float = 0.05):
        experiment_log = []
        experiment_log.append(f"Starting evolutionary search for Target Vibe: '{target_vibe}'\n")
        experiment_log.append(f"Config: {generations} Gens, Pop: {pop_size}, Elitism: {int(elitism_pct*100)}%\n\n")

        population = [self.generate_random_genome(target_vibe, f"g-1_i{i}") for i in range(pop_size)]
        history = {'best': [], 'avg': [], 'worst': []}
        population_snapshots = [] # To store samples for ancestry visualization
        num_elites = max(1, int(pop_size * elitism_pct))
        
        for generation in range(generations):
            experiment_log.append(f"--- GENERATION {generation} ---")
            
            for ind in population:
                if 'fitness' not in ind:
                    self.evaluate_fitness(ind, target_vibe)
            
            population.sort(key=lambda x: x['fitness'], reverse=True)
            
            best_fit = population[0]['fitness']
            avg_fit = sum(x['fitness'] for x in population) / pop_size
            worst_fit = population[-1]['fitness']
            
            history['best'].append(best_fit)
            history['avg'].append(avg_fit)
            history['worst'].append(worst_fit)
            
            # Store snapshot of entire population for scatter plots and lineage
            # We only store essential data to keep JSON light
            snapshot = []
            for ind in population:
                snapshot.append({
                    'id': ind['id'],
                    'parents': ind['parents'],
                    'fitness': ind['fitness'],
                    'vibe': ind['fitness_components']['vibe'],
                    'structure': ind['fitness_components']['structure'],
                    'novelty': ind['fitness_components']['novelty'],
                    'name': ind.get('strDrink', 'Unknown')
                })
            population_snapshots.append(snapshot)

            experiment_log.append(f"Best Fitness: {best_fit:.4f}  |  Avg Fitness: {avg_fit:.4f} | Worst: {worst_fit:.4f}")
            
            if generation % 5 == 0 or generation == generations - 1:
                print(f"Gen {generation} | Best: {best_fit:.4f} | Avg: {avg_fit:.4f}")
            
            new_population = []
            elites = copy.deepcopy(population[:num_elites])
            new_population.extend(elites)
            experiment_log.append(f"Elitism: Retained top {num_elites} individuals directly.")
            
            # Use tournament selection for creating children
            crossovers_count = 0
            while len(new_population) < pop_size:
                crossovers_count += 1
                selection_indices = random.sample(range(len(population)), 3)
                p1_idx = min(selection_indices)
                selection_indices2 = random.sample(range(len(population)), 3)
                p2_idx = min(selection_indices2)
                
                parent1 = population[p1_idx]
                parent2 = population[p2_idx]
                
                if crossovers_count < 3:
                    experiment_log.append(f"Selection Event: Tournament selection. Winner #1 (Fit: {parent1['fitness']:.3f}) defeated others.")
                    
                log_pass = experiment_log if crossovers_count < 3 else None
                
                c1, c2 = self.crossover(parent1, parent2, generation, len(new_population), log=log_pass)
                c1 = self.mutate(c1, log=log_pass)
                c2 = self.mutate(c2, log=log_pass)
                
                new_population.append(c1)
                if len(new_population) < pop_size:
                    new_population.append(c2)
                    
            experiment_log.append("\n")        
            population = new_population
            
        for ind in population:
            self.evaluate_fitness(ind, target_vibe)
        population.sort(key=lambda x: x['fitness'], reverse=True)
        
        experiment_log.append("=== EVOLUTION COMPLETE ===")
        experiment_log.append(f"Alpha Final Fitness: {population[0]['fitness']}")
            
        return population[0], history, experiment_log, population_snapshots

if __name__ == "__main__":
    from data_loader import load_and_standardize_data
    from pathlib import Path
    
    base_dir = Path("/Users/rajithsingh/Desktop/COCKTAIL GENERATION WITH GA/Data/raw")
    df = load_and_standardize_data(base_dir / "Cocktail metadata.csv", base_dir / "Recipe details.csv")
    
    ga = EvolutionaryMixology(df=df)
    alpha, hist, exp_log = ga.evolve(target_vibe="Smoky, late night, contemplative", generations=3, pop_size=10)
    print("\nLog Truncated:\n", "\n".join(exp_log[:15]))
