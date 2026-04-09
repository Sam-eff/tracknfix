import os
import glob

files = glob.glob("/Users/samuel/Documents/Techshopmananger/frontend/src/**/*.tsx", recursive=True)

for filepath in files:
    with open(filepath, "r") as f:
        content = f.read()
    
    new_content = content.replace("var(--color-primary-dark)", "var(--color-primary)")
        
    if content != new_content:
        with open(filepath, "w") as f:
            f.write(new_content)
        print(f"Updated {filepath}")
print("Done replacing primary-dark!")
