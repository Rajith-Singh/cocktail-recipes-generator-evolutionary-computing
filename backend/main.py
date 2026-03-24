from fastapi import FastAPI
from pydantic import BaseModel
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import io
import zipfile
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from evolution import EvolutionaryMixology
from data_loader import load_and_standardize_data
from pathlib import Path

app = FastAPI(title="Bartender AI Innovation Studio")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load dataset once
base_dir = Path("/Users/rajithsingh/Desktop/COCKTAIL GENERATION WITH GA/Data/raw")
try:
    df = load_and_standardize_data(base_dir / "Cocktail metadata.csv", base_dir / "Recipe details.csv")
    ga = EvolutionaryMixology(df=df)
except Exception as e:
    print(f"Failed to load dataset: {e}")
    df = None
    ga = EvolutionaryMixology()

# Store latest run results in memory
latest_run = {}

class EvolveRequest(BaseModel):
    target_vibe: str
    generations: int = 20
    pop_size: int = 50

@app.post("/evolve")
def evolve_cocktail(request: EvolveRequest):
    alpha, history, exp_log = ga.evolve(
        target_vibe=request.target_vibe,
        generations=request.generations,
        pop_size=request.pop_size
    )
    
    latest_run['alpha'] = alpha
    latest_run['history'] = history
    latest_run['vibe'] = request.target_vibe
    latest_run['exp_log'] = exp_log
    
    # Calculate ABV (Rough estimate: Base=40%, Modifier=20%, other=0)
    total_ml = 0
    alcohol_ml = 0
    for ing in alpha['Parsed_Ingredients']:
        ml = ing['ml']
        total_ml += ml
        if ing['category'] == 'BASE':
            alcohol_ml += ml * 0.40
        elif ing['category'] == 'MODIFIER':
            alcohol_ml += ml * 0.20
    
    abv = (alcohol_ml / total_ml) * 100 if total_ml > 0 else 0
    
    # Generate creative name
    name_parts = alpha['Parsed_Ingredients']
    if len(name_parts) > 0:
        main_ing = [i['name'] for i in name_parts if i['category'] == 'BASE']
        if not main_ing:
            main_ing = [name_parts[0]['name']]
        alpha['generated_name'] = f"The Evolved {main_ing[0].split()[0]}"
    else:
        alpha['generated_name'] = "The Void"
        
    alpha['estimated_abv'] = round(abv, 1)
    
    # Simple instruction generator
    method = alpha.get('Method', 'Stirred')
    glass = alpha.get('Glass', 'Cocktail glass')
    if method == 'Shaken':
        instructions = f"Combine all ingredients in a shaker with ice. Shake vigorously to chill and dilute. Strain into a chilled {glass}."
    else:
        instructions = f"Combine all ingredients in a mixing glass with ice. Stir until well-chilled. Strain into a chilled {glass}."
    alpha['generated_instructions'] = instructions
        
    return {
        "alpha": alpha,
        "history": history,
        "exp_log": exp_log
    }

@app.get("/analytics")
def get_analytics():
    if 'history' not in latest_run:
        return {"error": "No data yet. Run /evolve first."}
    return latest_run['history']

@app.get("/export")
def export_results():
    if 'alpha' not in latest_run:
        return {"error": "No data yet"}
        
    alpha = latest_run['alpha']
    history = latest_run['history']
    exp_log_arr = latest_run.get('exp_log', [])
    
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        # 1. Fitness Plot
        plt.figure(figsize=(8, 5))
        plt.plot(history['best'], label='Best Fitness', color='green')
        plt.plot(history['avg'], label='Average Fitness', color='orange')
        plt.title('Genetic Algorithm Evolution: Fitness over Generations')
        plt.xlabel('Generation')
        plt.ylabel('Fitness Score')
        plt.legend()
        plt.grid(True, alpha=0.3)
        img_buf = io.BytesIO()
        plt.savefig(img_buf, format='png')
        # 2. Radar Chart for Alpha Cocktail
        plt.figure(figsize=(6, 6))
        categories = ['Vibe Match', 'Structural Balance', 'Novelty']
        values = [alpha['fitness_components']['vibe'], 
                  alpha['fitness_components']['structure'], 
                  alpha['fitness_components']['novelty']]
        
        # Close the polar loop
        categories = [*categories, categories[0]]
        values = [*values, values[0]]
        
        ax = plt.subplot(111, polar=True)
        angles = np.linspace(0, 2 * np.pi, len(categories) - 1, endpoint=False).tolist()
        angles += angles[:1]
        
        ax.plot(angles, values, linewidth=2, linestyle='solid', label='Alpha Cocktail Profile', color='magenta')
        ax.fill(angles, values, alpha=0.25, color='magenta')
        ax.set_thetagrids(np.degrees(angles[:-1]), categories[:-1], fontsize=12)
        ax.set_ylim(0, 1)
        ax.set_title("Alpha Cocktail Fitness Profile", size=14, y=1.1)
        
        radar_buf = io.BytesIO()
        plt.savefig(radar_buf, format='png')
        plt.close()
        zip_file.writestr('fitness_radar_chart.png', radar_buf.getvalue())
        
        # 3. Recipe Summary
        summary = f"Target Vibe: {latest_run['vibe']}\n"
        summary += f"Alpha Cocktail Name: {alpha.get('generated_name')}\n"
        summary += f"Score: {alpha['fitness']:.4f}\n\n"
        summary += "Components:\n"
        summary += f"Vibe Match: {alpha['fitness_components']['vibe']:.4f}\n"
        summary += f"Structural Balance: {alpha['fitness_components']['structure']:.4f}\n"
        summary += f"Novelty: {alpha['fitness_components']['novelty']:.4f}\n\n"
        summary += f"Method: {alpha.get('Method', 'Stirred')}\n"
        summary += f"Instructions: {alpha.get('generated_instructions')}\n"
        summary += f"Estimated ABV: {alpha.get('estimated_abv', 0)}%\n\nIngredients:\n"
        
        for ing in alpha['Parsed_Ingredients']:
            summary += f"- {ing['ml']} ml {ing['name']} [{ing['category']}]\n"
            
        zip_file.writestr('alpha_cocktail_summary.txt', summary)
        
        # 4. Experiment Tracker Log
        log_text = "\n".join(exp_log_arr)
        zip_file.writestr('experiment_log.txt', log_text)
        
    return StreamingResponse(
        iter([zip_buffer.getvalue()]),
        media_type="application/x-zip-compressed",
        headers={"Content-Disposition": f"attachment; filename=evolution_results.zip"}
    )

