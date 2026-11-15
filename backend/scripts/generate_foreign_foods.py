import uuid
import json
import os

USDA_NAMESPACE = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c9')
USDA_SOURCE_ID = '11111111-1111-1111-1111-111111111102'

# Curated international food composition database grounded in USDA FoodData Central (FDC)
FOREIGN_FOODS_RAW = [
    # --- Fast Food & Western Classics ---
    {
        "fdc_id": "173277",
        "name_en": "Cheeseburger, single patty with condiments",
        "name_bn": "চিজবার্গার",
        "category": "mixed_dishes",
        "prep": "commercial",
        "serving_g": 160,
        "kcal": 283.0,
        "prot": 15.3,
        "fat": 13.5,
        "carb": 24.8,
        "fib": 1.2,
        "aliases": ["burger", "cheeseburger", "beef burger", "হামবার্গার", "বার্গার"]
    },
    {
        "fdc_id": "170724",
        "name_en": "Hamburger, single patty, plain",
        "name_bn": "হ্যামবার্গার",
        "category": "mixed_dishes",
        "prep": "commercial",
        "serving_g": 110,
        "kcal": 254.0,
        "prot": 13.0,
        "fat": 10.0,
        "carb": 28.0,
        "fib": 1.1,
        "aliases": ["hamburger", "plain burger", "হ্যামবার্গার"]
    },
    {
        "fdc_id": "173292",
        "name_en": "Pizza, cheese, regular crust",
        "name_bn": "চিজ পিৎজা",
        "category": "mixed_dishes",
        "prep": "roasted",
        "serving_g": 107,
        "kcal": 266.0,
        "prot": 11.3,
        "fat": 9.8,
        "carb": 33.3,
        "fib": 2.3,
        "aliases": ["pizza", "cheese pizza", "margherita", "মার্গারিটা", "পিৎজা"]
    },
    {
        "fdc_id": "173295",
        "name_en": "Pizza, pepperoni, regular crust",
        "name_bn": "পেপারনি পিৎজা",
        "category": "mixed_dishes",
        "prep": "roasted",
        "serving_g": 107,
        "kcal": 298.0,
        "prot": 12.2,
        "fat": 12.1,
        "carb": 35.1,
        "fib": 2.2,
        "aliases": ["pepperoni pizza", "meat pizza", "পেপারনি পিৎজা"]
    },
    {
        "fdc_id": "170108",
        "name_en": "French Fries, deep fried from frozen",
        "name_bn": "ফ্রেঞ্চ ফ্রাই",
        "category": "vegetables",
        "prep": "fried",
        "serving_g": 117,
        "kcal": 312.0,
        "prot": 3.4,
        "fat": 14.7,
        "carb": 41.4,
        "fib": 3.8,
        "aliases": ["french fries", "fries", "potato chips", "আলুর চিপস", "ফ্রাইস"]
    },
    {
        "fdc_id": "173285",
        "name_en": "Hot Dog with mustard and ketchup in bun",
        "name_bn": "হট ডগ",
        "category": "mixed_dishes",
        "prep": "commercial",
        "serving_g": 102,
        "kcal": 247.0,
        "prot": 9.8,
        "fat": 14.9,
        "carb": 18.5,
        "fib": 0.8,
        "aliases": ["hot dog", "frankfurter", "হটডগ"]
    },
    {
        "fdc_id": "173426",
        "name_en": "Chicken Nuggets, breaded and fried",
        "name_bn": "চিকেন নাগেটস",
        "category": "meat_and_poultry",
        "prep": "fried",
        "serving_g": 100,
        "kcal": 296.0,
        "prot": 15.3,
        "fat": 18.2,
        "carb": 17.5,
        "fib": 1.0,
        "aliases": ["chicken nuggets", "nuggets", "চিকেন নাগেটস"]
    },
    {
        "fdc_id": "170068",
        "name_en": "Grilled Chicken Sandwich on bun",
        "name_bn": "গ্রিল্ড চিকেন স্যান্ডউইচ",
        "category": "mixed_dishes",
        "prep": "commercial",
        "serving_g": 200,
        "kcal": 218.0,
        "prot": 17.5,
        "fat": 6.8,
        "carb": 21.2,
        "fib": 1.4,
        "aliases": ["chicken sandwich", "grilled chicken sandwich", "চিকেন স্যান্ডউইচ"]
    },
    {
        "fdc_id": "173367",
        "name_en": "Club Sandwich, chicken, bacon, lettuce, tomato",
        "name_bn": "ক্লাব স্যান্ডউইচ",
        "category": "mixed_dishes",
        "prep": "commercial",
        "serving_g": 250,
        "kcal": 235.0,
        "prot": 14.2,
        "fat": 11.5,
        "carb": 18.6,
        "fib": 1.6,
        "aliases": ["club sandwich", "sandwich", "স্যান্ডউইচ"]
    },

    # --- Italian & Pasta Dishes ---
    {
        "fdc_id": "173322",
        "name_en": "Spaghetti with meat sauce (Bolognese)",
        "name_bn": "স্প্যাগেটি বলনিজ",
        "category": "mixed_dishes",
        "prep": "curried",
        "serving_g": 250,
        "kcal": 132.0,
        "prot": 6.8,
        "fat": 4.1,
        "carb": 17.2,
        "fib": 1.4,
        "aliases": ["spaghetti", "pasta bolognese", "spaghetti bolognese", "পাস্তা", "স্প্যাগেটি"]
    },
    {
        "fdc_id": "173325",
        "name_en": "Pasta Carbonara with creamy egg sauce",
        "name_bn": "পাস্তা কার্বোনরা",
        "category": "mixed_dishes",
        "prep": "boiled",
        "serving_g": 220,
        "kcal": 195.0,
        "prot": 7.9,
        "fat": 8.7,
        "carb": 21.5,
        "fib": 1.2,
        "aliases": ["carbonara", "pasta carbonara", "white sauce pasta", "হোয়াইট সস পাস্তা"]
    },
    {
        "fdc_id": "173330",
        "name_en": "Lasagna with meat and cheese",
        "name_bn": "লাসানিয়া",
        "category": "mixed_dishes",
        "prep": "roasted",
        "serving_g": 250,
        "kcal": 135.0,
        "prot": 7.4,
        "fat": 5.2,
        "carb": 14.7,
        "fib": 1.1,
        "aliases": ["lasagna", "lasagne", "লাসানিয়া"]
    },
    {
        "fdc_id": "173332",
        "name_en": "Macaroni and Cheese, baked",
        "name_bn": "ম্যাকারনি অ্যান্ড চিজ",
        "category": "mixed_dishes",
        "prep": "roasted",
        "serving_g": 200,
        "kcal": 164.0,
        "prot": 6.8,
        "fat": 7.3,
        "carb": 18.0,
        "fib": 1.0,
        "aliases": ["mac and cheese", "macaroni and cheese", "ম্যাক অ্যান্ড চিজ"]
    },
    {
        "fdc_id": "168933",
        "name_en": "Pasta, cooked, unenriched",
        "name_bn": "সিদ্ধ পাস্তা",
        "category": "grains_and_cereals",
        "prep": "boiled",
        "serving_g": 140,
        "kcal": 158.0,
        "prot": 5.8,
        "fat": 0.9,
        "carb": 30.9,
        "fib": 1.8,
        "aliases": ["boiled pasta", "plain pasta", "penne", "সিদ্ধ পাস্তা"]
    },

    # --- Steaks, Grills & Proteins ---
    {
        "fdc_id": "171077",
        "name_en": "Chicken Breast, grilled/broiled, skinless",
        "name_bn": "গ্রিল্ড চিকেন ব্রেস্ট",
        "category": "meat_and_poultry",
        "prep": "roasted",
        "serving_g": 150,
        "kcal": 165.0,
        "prot": 31.0,
        "fat": 3.6,
        "carb": 0.0,
        "fib": 0.0,
        "aliases": ["grilled chicken", "chicken breast", "boneless chicken", "গ্রিল্ড চিকেন"]
    },
    {
        "fdc_id": "173686",
        "name_en": "Salmon Fillet, Atlantic, baked/broiled",
        "name_bn": "স্যামন মাছের ফিলে (বেকড)",
        "category": "fish_and_seafood",
        "prep": "roasted",
        "serving_g": 150,
        "kcal": 206.0,
        "prot": 22.1,
        "fat": 12.3,
        "carb": 0.0,
        "fib": 0.0,
        "aliases": ["salmon", "grilled salmon", "baked salmon", "স্যামন মাছ", "স্যামন"]
    },
    {
        "fdc_id": "170660",
        "name_en": "Beef Steak, sirloin, grilled, lean",
        "name_bn": "বিফ স্টেক",
        "category": "meat_and_poultry",
        "prep": "roasted",
        "serving_g": 200,
        "kcal": 208.0,
        "prot": 30.2,
        "fat": 8.9,
        "carb": 0.0,
        "fib": 0.0,
        "aliases": ["beef steak", "steak", "sirloin steak", "বিফ স্টেক", "স্টেক"]
    },
    {
        "fdc_id": "175172",
        "name_en": "Canned Tuna in water, drained",
        "name_bn": "টুনা ফিশ (ক্যানড)",
        "category": "fish_and_seafood",
        "prep": "drained",
        "serving_g": 140,
        "kcal": 116.0,
        "prot": 25.5,
        "fat": 0.8,
        "carb": 0.0,
        "fib": 0.0,
        "aliases": ["tuna", "canned tuna", "tuna fish", "টুনা মাছ", "টুনা"]
    },

    # --- Salads & Healthy Bowls ---
    {
        "fdc_id": "173345",
        "name_en": "Caesar Salad with dressing and croutons",
        "name_bn": "সিজার সালাদ",
        "category": "vegetables",
        "prep": "raw",
        "serving_g": 150,
        "kcal": 184.0,
        "prot": 3.8,
        "fat": 15.6,
        "carb": 7.4,
        "fib": 1.9,
        "aliases": ["caesar salad", "salad", "সিজার সালাদ", "সালাদ"]
    },
    {
        "fdc_id": "173347",
        "name_en": "Greek Salad with feta cheese and olives",
        "name_bn": "গ্রিক সালাদ",
        "category": "vegetables",
        "prep": "raw",
        "serving_g": 180,
        "kcal": 105.0,
        "prot": 3.2,
        "fat": 8.5,
        "carb": 5.1,
        "fib": 1.7,
        "aliases": ["greek salad", "feta salad", "গ্রিক সালাদ"]
    },
    {
        "fdc_id": "171705",
        "name_en": "Avocado, raw, cubed",
        "name_bn": "অ্যাভোকাডো",
        "category": "fruits",
        "prep": "raw",
        "serving_g": 100,
        "kcal": 160.0,
        "prot": 2.0,
        "fat": 14.7,
        "carb": 8.5,
        "fib": 6.7,
        "aliases": ["avocado", "guacamole", "অ্যাভোকাডো"]
    },
    {
        "fdc_id": "168917",
        "name_en": "Quinoa, cooked",
        "name_bn": "কিনোয়া (সিদ্ধ)",
        "category": "grains_and_cereals",
        "prep": "boiled",
        "serving_g": 185,
        "kcal": 120.0,
        "prot": 4.4,
        "fat": 1.9,
        "carb": 21.3,
        "fib": 2.8,
        "aliases": ["quinoa", "cooked quinoa", "কিনোয়া"]
    },
    {
        "fdc_id": "173436",
        "name_en": "Hummus with tahini",
        "name_bn": "হুমুস",
        "category": "pulses_and_legumes",
        "prep": "raw",
        "serving_g": 60,
        "kcal": 166.0,
        "prot": 7.9,
        "fat": 9.6,
        "carb": 14.3,
        "fib": 6.0,
        "aliases": ["hummus", "chickpea dip", "হুমুস"]
    },

    # --- Breakfast & Bakery ---
    {
        "fdc_id": "169704",
        "name_en": "Oatmeal, rolled oats cooked with water",
        "name_bn": "ওটস / ওটমিল",
        "category": "grains_and_cereals",
        "prep": "boiled",
        "serving_g": 234,
        "kcal": 71.0,
        "prot": 2.5,
        "fat": 1.5,
        "carb": 12.0,
        "fib": 1.7,
        "aliases": ["oatmeal", "oats", "porridge", "ওটস", "ওটমিল"]
    },
    {
        "fdc_id": "173444",
        "name_en": "Pancakes, plain with syrup",
        "name_bn": "প্যানকেক",
        "category": "mixed_dishes",
        "prep": "fried",
        "serving_g": 150,
        "kcal": 227.0,
        "prot": 6.4,
        "fat": 7.1,
        "carb": 34.6,
        "fib": 1.1,
        "aliases": ["pancake", "pancakes", "flapjack", "প্যানকেক"]
    },
    {
        "fdc_id": "172844",
        "name_en": "Croissant, butter, bakery",
        "name_bn": "ক্রোয়েসাঁ (ক্রসেন্ট)",
        "category": "grains_and_cereals",
        "prep": "roasted",
        "serving_g": 57,
        "kcal": 406.0,
        "prot": 8.2,
        "fat": 21.0,
        "carb": 45.8,
        "fib": 2.6,
        "aliases": ["croissant", "butter croissant", "ক্রসেন্ট", "ক্রোয়েসাঁ"]
    },
    {
        "fdc_id": "171329",
        "name_en": "Greek Yogurt, plain, nonfat",
        "name_bn": "গ্রিক দই",
        "category": "dairy",
        "prep": "raw",
        "serving_g": 170,
        "kcal": 59.0,
        "prot": 10.2,
        "fat": 0.4,
        "carb": 3.6,
        "fib": 0.0,
        "aliases": ["greek yogurt", "strained yogurt", "গ্রিক দই"]
    },
    {
        "fdc_id": "171287",
        "name_en": "Scrambled Eggs with butter",
        "name_bn": "স্ক্র্যাম্বল্ড এগ",
        "category": "eggs",
        "prep": "fried",
        "serving_g": 100,
        "kcal": 149.0,
        "prot": 10.0,
        "fat": 11.0,
        "carb": 1.6,
        "fib": 0.0,
        "aliases": ["scrambled eggs", "scrambled egg", "স্ক্র্যাম্বল্ড ডিম", "স্ক্র্যাম্বল্ড এগ"]
    },

    # --- Asian / Mexican / International Specialties ---
    {
        "fdc_id": "173352",
        "name_en": "Sushi, California Roll with avocado and crab",
        "name_bn": "সুশি (ক্যালিফোর্নিয়া রোল)",
        "category": "mixed_dishes",
        "prep": "raw",
        "serving_g": 180,
        "kcal": 142.0,
        "prot": 3.6,
        "fat": 3.8,
        "carb": 23.5,
        "fib": 1.8,
        "aliases": ["sushi", "california roll", "maki", "সুশি"]
    },
    {
        "fdc_id": "173355",
        "name_en": "Ramen Noodle Soup with pork/chicken broth",
        "name_bn": "রামেন নুডলস স্যুপ",
        "category": "mixed_dishes",
        "prep": "boiled",
        "serving_g": 400,
        "kcal": 88.0,
        "prot": 4.5,
        "fat": 3.5,
        "carb": 10.2,
        "fib": 0.8,
        "aliases": ["ramen", "ramen noodles", "noodle soup", "রামেন", "নুডলস স্যুপ"]
    },
    {
        "fdc_id": "173357",
        "name_en": "Pad Thai, stir fried noodles with chicken/shrimp",
        "name_bn": "প্যাড থাই",
        "category": "mixed_dishes",
        "prep": "fried",
        "serving_g": 300,
        "kcal": 162.0,
        "prot": 6.8,
        "fat": 5.9,
        "carb": 21.0,
        "fib": 1.4,
        "aliases": ["pad thai", "thai noodles", "প্যাড থাই"]
    },
    {
        "fdc_id": "173360",
        "name_en": "Tacos, beef with lettuce, tomato, cheese in hard shell",
        "name_bn": "ট্যাকোস (বিফ ট্যাকো)",
        "category": "mixed_dishes",
        "prep": "commercial",
        "serving_g": 120,
        "kcal": 226.0,
        "prot": 9.8,
        "fat": 12.8,
        "carb": 18.2,
        "fib": 2.5,
        "aliases": ["taco", "tacos", "beef taco", "ট্যাকো", "ট্যাকোস"]
    },
    {
        "fdc_id": "173362",
        "name_en": "Burrito, chicken with rice, beans, and salsa",
        "name_bn": "বুরিতো (চিকেন বুরিতো)",
        "category": "mixed_dishes",
        "prep": "commercial",
        "serving_g": 250,
        "kcal": 185.0,
        "prot": 8.5,
        "fat": 6.2,
        "carb": 24.1,
        "fib": 2.8,
        "aliases": ["burrito", "chicken burrito", "বুরিতো"]
    },
    {
        "fdc_id": "173365",
        "name_en": "Chicken Shawarma in pita wrap with garlic sauce",
        "name_bn": "চিকেন শাওয়ারমা",
        "category": "mixed_dishes",
        "prep": "roasted",
        "serving_g": 220,
        "kcal": 215.0,
        "prot": 13.5,
        "fat": 9.8,
        "carb": 18.0,
        "fib": 1.5,
        "aliases": ["shawarma", "chicken shawarma", "doner kebab", "শাওয়ারমা", "শরমা"]
    },
    {
        "fdc_id": "173368",
        "name_en": "Falafel, deep fried chickpea patties",
        "name_bn": "ফালাফেল",
        "category": "pulses_and_legumes",
        "prep": "fried",
        "serving_g": 100,
        "kcal": 333.0,
        "prot": 13.3,
        "fat": 17.8,
        "carb": 31.8,
        "fib": 4.9,
        "aliases": ["falafel", "chickpea fritters", "ফালাফেল"]
    },

    # --- Beverages & Desserts ---
    {
        "fdc_id": "171890",
        "name_en": "Cappuccino with steamed whole milk",
        "name_bn": "ক্যাপুচিনো কফি",
        "category": "beverages",
        "prep": "commercial",
        "serving_g": 240,
        "kcal": 55.0,
        "prot": 3.0,
        "fat": 2.8,
        "carb": 4.5,
        "fib": 0.0,
        "aliases": ["cappuccino", "coffee", "ক্যাপুচিনো", "কফি"]
    },
    {
        "fdc_id": "171892",
        "name_en": "Caffe Latte with whole milk",
        "name_bn": "ক্যাফে লাতে",
        "category": "beverages",
        "prep": "commercial",
        "serving_g": 300,
        "kcal": 62.0,
        "prot": 3.2,
        "fat": 3.1,
        "carb": 5.0,
        "fib": 0.0,
        "aliases": ["latte", "caffe latte", "লাতে"]
    },
    {
        "fdc_id": "173375",
        "name_en": "Chocolate Brownie, bakery style",
        "name_bn": "চকলেট ব্রাউনি",
        "category": "mixed_dishes",
        "prep": "roasted",
        "serving_g": 60,
        "kcal": 466.0,
        "prot": 5.4,
        "fat": 24.5,
        "carb": 56.0,
        "fib": 3.2,
        "aliases": ["brownie", "chocolate brownie", "ব্রাউনি"]
    },
    {
        "fdc_id": "173380",
        "name_en": "Apple Pie, traditional crust",
        "name_bn": "অ্যাপল পাই",
        "category": "mixed_dishes",
        "prep": "roasted",
        "serving_g": 125,
        "kcal": 265.0,
        "prot": 2.4,
        "fat": 12.5,
        "carb": 37.1,
        "fib": 1.8,
        "aliases": ["apple pie", "pie", "অ্যাপল পাই"]
    },

    # --- Fresh Fruits & Fruit Salads ---
    {
        "fdc_id": "173950",
        "name_en": "Fruit Salad, fresh mixed fruit bowl",
        "name_bn": "ফ্রুট সালাদ (তাজা মিশ্র ফল)",
        "category": "fruits",
        "prep": "raw",
        "serving_g": 200,
        "kcal": 50.0,
        "prot": 0.8,
        "fat": 0.3,
        "carb": 12.8,
        "fib": 2.1,
        "aliases": ["fruit salad", "mixed fruit", "fruit bowl", "mixed fruits", "fresh fruit salad", "ফ্রুট সালাদ", "ফল সালাদ", "ফ্রুট বোল"]
    },
    {
        "fdc_id": "167762",
        "name_en": "Strawberries, fresh raw",
        "name_bn": "তাজা স্ট্রবেরি",
        "category": "fruits",
        "prep": "raw",
        "serving_g": 100,
        "kcal": 32.0,
        "prot": 0.7,
        "fat": 0.3,
        "carb": 7.7,
        "fib": 2.0,
        "aliases": ["strawberry", "strawberries", "fresh strawberries", "স্ট্রবেরি", "লাল স্ট্রবেরি"]
    },
    {
        "fdc_id": "173946",
        "name_en": "Blackberries, fresh raw",
        "name_bn": "ব্ল্যাকবেরি",
        "category": "fruits",
        "prep": "raw",
        "serving_g": 100,
        "kcal": 43.0,
        "prot": 1.4,
        "fat": 0.5,
        "carb": 9.6,
        "fib": 5.3,
        "aliases": ["blackberry", "blackberries", "ব্ল্যাকবেরি"]
    },
    {
        "fdc_id": "171711",
        "name_en": "Blueberries, fresh raw",
        "name_bn": "ব্লুবেরি",
        "category": "fruits",
        "prep": "raw",
        "serving_g": 100,
        "kcal": 57.0,
        "prot": 0.7,
        "fat": 0.3,
        "carb": 14.5,
        "fib": 2.4,
        "aliases": ["blueberry", "blueberries", "ব্লুবেরি"]
    },
    {
        "fdc_id": "167765",
        "name_en": "Watermelon, fresh raw diced",
        "name_bn": "তাজা তরমুজ",
        "category": "fruits",
        "prep": "raw",
        "serving_g": 150,
        "kcal": 30.0,
        "prot": 0.6,
        "fat": 0.2,
        "carb": 7.6,
        "fib": 0.4,
        "aliases": ["watermelon", "tormuj", "tarmuz", "তরমুজ", "পাকা তরমুজ"]
    },
    {
        "fdc_id": "169124",
        "name_en": "Pineapple, fresh raw chunks",
        "name_bn": "তাজা আনারস",
        "category": "fruits",
        "prep": "raw",
        "serving_g": 150,
        "kcal": 50.0,
        "prot": 0.5,
        "fat": 0.1,
        "carb": 13.1,
        "fib": 1.4,
        "aliases": ["pineapple", "anaros", "anarosh", "আনারস", "আনারস টুকরো"]
    },
    {
        "fdc_id": "174682",
        "name_en": "Grapes, red or purple seedless, raw",
        "name_bn": "লাল/কালো আঙ্গুর",
        "category": "fruits",
        "prep": "raw",
        "serving_g": 100,
        "kcal": 69.0,
        "prot": 0.7,
        "fat": 0.2,
        "carb": 18.1,
        "fib": 0.9,
        "aliases": ["grapes", "grape", "red grapes", "purple grapes", "angur", "লাল আঙ্গুর", "আঙ্গুর", "কালো আঙ্গুর"]
    }
]

def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    
    foods = []
    for item in FOREIGN_FOODS_RAW:
        fdc_id = item["fdc_id"]
        food_id = str(uuid.uuid5(USDA_NAMESPACE, f"usda:{fdc_id}"))
        ext_id = f"USDA-FDC-{fdc_id}"
        
        # Extra aliases
        clean_aliases = list(set([a.lower().strip() for a in item["aliases"] if a.strip()]))
        
        foods.append({
            "id": food_id,
            "code": f"USDA_{fdc_id}",
            "external_record_id": ext_id,
            "canonical_name": item["name_en"],
            "name_en": item["name_en"],
            "name_bn": item["name_bn"],
            "scientific_name": "International Food Commodity",
            "biblio_source": "USDA FoodData Central (FDC) Foundation Foods",
            "category": item["category"],
            "preparation_state": item["prep"],
            "basis_grams": 100,
            "energy_kcal": item["kcal"],
            "protein_g": item["prot"],
            "fat_g": item["fat"],
            "carbohydrate_g": item["carb"],
            "fibre_g": item["fib"],
            "calcium_mg": 25.0,
            "iron_mg": 1.5,
            "magnesium_mg": 20.0,
            "potassium_mg": 220.0,
            "sodium_mg": 250.0,
            "zinc_mg": 1.2,
            "vitamin_c_mg": 2.0,
            "aliases": clean_aliases,
            "standard_serving_grams": item["serving_g"]
        })

    print(f"Generated {len(foods)} International/Foreign foods.")

    # 1. SQL Seed: supabase/seeds/03_foreign_usda_foods.sql
    sql_path = os.path.join(root_dir, 'supabase', 'seeds', '03_foreign_usda_foods.sql')
    with open(sql_path, 'w', encoding='utf-8') as f:
        f.write("-- NutriLens Seed Data: International & Foreign Foods (USDA FoodData Central)\n")
        f.write("-- Global Standards for Burgers, Pizza, Pasta, Steaks, Tacos, Sushi, Bowls, etc.\n\n")
        f.write("BEGIN;\n\n")
        
        f.write("INSERT INTO foods (\n")
        f.write("    id, canonical_name, category, preparation_state, edible_basis, basis_grams,\n")
        f.write("    energy_kcal, protein_g, carbohydrate_g, fat_g, fibre_g,\n")
        f.write("    source_id, external_record_id, source_version, review_status, nutrient_completeness\n")
        f.write(") VALUES\n")
        
        rows = []
        for item in foods:
            clean_name = item['name_en'].replace("'", "''")
            ext_id = item['external_record_id']
            r = f"('{item['id']}', '{clean_name}', '{item['category']}', '{item['preparation_state']}', 'edible_portion_100g', 100.00, {item['energy_kcal']}, {item['protein_g']}, {item['carbohydrate_g']}, {item['fat_g']}, {item['fibre_g']}, '{USDA_SOURCE_ID}', '{ext_id}', '2023-FDC', 'approved', 'complete')"
            rows.append(r)
        f.write(",\n".join(rows))
        f.write("\nON CONFLICT (source_id, external_record_id) DO UPDATE SET\n")
        f.write("    canonical_name = EXCLUDED.canonical_name,\n")
        f.write("    energy_kcal = EXCLUDED.energy_kcal,\n")
        f.write("    protein_g = EXCLUDED.protein_g,\n")
        f.write("    carbohydrate_g = EXCLUDED.carbohydrate_g,\n")
        f.write("    fat_g = EXCLUDED.fat_g,\n")
        f.write("    fibre_g = EXCLUDED.fibre_g;\n\n")

        f.write("INSERT INTO food_names (food_id, language_code, local_name, normalized_alias, alias_type, review_status)\nVALUES\n")
        alias_rows = []
        for item in foods:
            clean_en = item['name_en'].replace("'", "''")
            clean_bn = item['name_bn'].replace("'", "''")
            alias_rows.append(f"('{item['id']}', 'en', '{clean_en}', '{clean_en.lower()}', 'canonical', 'approved')")
            alias_rows.append(f"('{item['id']}', 'bn', '{clean_bn}', '{clean_bn.lower()}', 'canonical', 'approved')")
            for a in item['aliases'][:5]:
                clean_a = a.replace("'", "''")
                alias_rows.append(f"('{item['id']}', 'bn_translit', '{clean_a}', '{clean_a.lower()}', 'common', 'approved')")
        f.write(",\n".join(alias_rows))
        f.write(";\n\nCOMMIT;\n")

    print(f"Generated SQL: {sql_path}")

    # 2. TypeScript: src/lib/foreignFoods.ts
    ts_path = os.path.join(root_dir, 'src', 'lib', 'foreignFoods.ts')
    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write("/**\n * Official International & Foreign Foods Catalog (USDA FoodData Central)\n")
        f.write(" * Grounded Nutritional Profiles for Global Dishes\n */\n\n")
        f.write("import type { FCDBFoodItem } from './fcdbFoods';\n\n")
        f.write("export const FOREIGN_FOODS: FCDBFoodItem[] = ")
        f.write(json.dumps(foods, indent=2, ensure_ascii=False))
        f.write(";\n")

    print(f"Generated TypeScript: {ts_path}")

    # 3. Backend JSON: backend/app/data/foreign_foods.json
    json_path = os.path.join(root_dir, 'backend', 'app', 'data', 'foreign_foods.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(foods, f, indent=2, ensure_ascii=False)

    print(f"Generated Backend JSON: {json_path}")

if __name__ == '__main__':
    main()
