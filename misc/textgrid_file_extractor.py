import pandas as pd
from praatio import textgrid

# Load your TextGrid file
tg = textgrid.openTextgrid("your_file.TextGrid", includeEmptyIntervals=False)

# Select the specific tier name you want to extract (e.g., "words" or "phones")
tier_name = "words"  
tier = tg.getTier(tier_name)

# Extract raw data intervals
data = []
for start, end, label in tier.entries:
    data.append({"Start_Time": start, "End_Time": end, "Label": label})

# Convert to a DataFrame and export to CSV
df = pd.DataFrame(data)
df.to_csv("time_table.csv", index=False)
print(df)
