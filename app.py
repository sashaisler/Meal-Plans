from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

class BarnardPlan:
    def __init__(self, name, meals, points, cost, is_per_week):
        self.name = name
        self.meals = meals
        self.points = points
        self.cost = cost
        self.is_per_week = is_per_week

    def to_dict(self):
        return {
            "name": self.name,
            "meals": self.meals,
            "points": self.points,
            "cost": self.cost,
            "type": "Per Week" if self.is_per_week else "Per Term"
        }


class ColumbiaPlan:
    def __init__(self, name, meals, complimentary, dining_dollars, flex, cost, is_per_week):
        self.name = name
        self.meals = meals
        self.complimentary = complimentary
        self.dining_dollars = dining_dollars
        self.flex = flex
        self.cost = cost
        self.is_per_week = is_per_week

    def to_dict(self):
        return {
            "name": self.name,
            "meals": self.meals,
            "complimentary": self.complimentary,
            "dining_dollars": self.dining_dollars,
            "flex": self.flex,
            "cost": self.cost,
            "type": "Per Week" if self.is_per_week else "Per Term"
        }

# Sample data
columbia_plans = [
    ColumbiaPlan("Plan A / Weekly", 14, 21, 0, 200, 3137, True),
    ColumbiaPlan("Plan A / Term", 210, 6, 100, 100, 3084, False),
    ColumbiaPlan("Plan A / Meals", 210, 6, 0, 0, 2871, False),
    ColumbiaPlan("Plan B / Dining Dollars", 175, 6, 100, 100, 2853, False),
    ColumbiaPlan("Plan B / Flex", 175, 6, 0, 200, 2853, False),
    ColumbiaPlan("Plan C", 150, 6, 75, 75, 2491, False),
    ColumbiaPlan("Plan D", 100, 4, 0, 125, 1781, False),
    ColumbiaPlan("EZ 18", 18, 21, 0, 100, 3541, True),
    ColumbiaPlan("EZ 19", 19, 21, 75, 0, 3290, True),
    ColumbiaPlan("EZ 350", 350, 21, 0, 150, 3591, False)
]

barnard_plans = [
    BarnardPlan("Platinum Plan", 19, 150, 4296, True),
    BarnardPlan("Flex 150 Plan", 150, 625, 2949, False),
    BarnardPlan("Flex 125 Plan", 125, 400, 2374, False),
    BarnardPlan("Flex 75 Plan", 75, 200, 1350, False),
    BarnardPlan("Flex 30 Plan", 30, 150, 624, False),
    BarnardPlan("Convenience 500", 0, 500, 554, False)
]

# Default meal costs
meal_costs = {'Breakfast': 10, 'Lunch': 13, 'Dinner': 16, 'Brunch': 16}

@app.route('/')
def index():
    return render_template('index.html') 

@app.route('/calculate', methods=['POST'])
def calculate_meals():
    try:
        user_meal_counts = {meal: int(request.form.get(meal, 0)) for meal in ['Breakfast', 'Lunch', 'Dinner', 'Brunch']}
        total_meals, out_of_pocket_cost, out_of_pocket_unit = calculate_out_of_pocket_cost(user_meal_counts, meal_costs)
        columbia_results = evaluate_plans(columbia_plans, meal_costs, True)
        barnard_results = evaluate_plans(barnard_plans, meal_costs, False)
        
        response_data = {
            'columbia_results': columbia_results,
            'barnard_results': barnard_results,
            'total_meals': total_meals,
            'out_of_pocket_cost': out_of_pocket_cost,
            'out_of_pocket_unit': out_of_pocket_unit
        }
        return jsonify(response_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


def calculate_out_of_pocket_cost(meal_counts, meal_prices):
    total_cost = sum(meal_counts[meal] * meal_prices[meal] for meal in meal_counts)
    total_meals = sum(meal_counts.values())
    unit_price = total_cost / total_meals if total_meals else float('inf')
    return total_meals, total_cost, unit_price

def calculate_total_meals(plan, meal_prices, is_columbia):
    total_swipe_meals = plan.meals + (plan.complimentary if is_columbia else 0)
    total_assets = plan.dining_dollars + plan.flex if is_columbia else plan.points
    cheapest_meal_cost = min(meal_prices.values())
    meals_from_assets = int(total_assets / cheapest_meal_cost)
    return total_swipe_meals + meals_from_assets

def evaluate_plans(plans, meal_prices, is_columbia):
    results = []
    for plan in plans:
        if not plan.is_per_week:
            total_meals_covered = calculate_total_meals(plan, meal_prices, is_columbia)
            unit_price = plan.cost / total_meals_covered if total_meals_covered else float('inf')
            plan_dict = plan.to_dict()
            plan_dict.update({'meals_covered': total_meals_covered, 'unit_price': unit_price})
            results.append(plan_dict)
    return sorted(results, key=lambda x: x['unit_price'])

if __name__ == '__main__':
    app.run(debug=True)