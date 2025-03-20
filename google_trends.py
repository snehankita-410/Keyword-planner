from pytrends.request import TrendReq
import sys
import pandas as pd

# Suppress the FutureWarning
pd.set_option('future.no_silent_downcasting', True)

def get_google_trends(keyword):
    pytrends = TrendReq(hl='en-US', tz=360)
    pytrends.build_payload([keyword], cat=0, timeframe='now 7-d', geo='', gprop='')

    df = pytrends.interest_over_time()

    # Handle empty or missing data
    if df.empty or 'isPartial' not in df.columns:
        print(0)
        return
    
    df = df.infer_objects(copy=False)  # New recommended method
    df = df.fillna(False)  # Handle NaN values
    latest_value = df.iloc[-1][keyword]  # Get the latest search volume

    print(latest_value)  # Return value for Node.js
    return latest_value

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: No keyword provided.")
    else:
        keyword = sys.argv[1]
        get_google_trends(keyword)
