class BarnardPlan {
    constructor(name, meals, points, cost, isPerWeek) {
        this.name = name;
        this.meals = meals;
        this.points = points;
        this.cost = cost;
        this.isPerWeek = isPerWeek;
    }

    toDict() {
        return {
            name: this.name,
            meals: this.meals,
            points: this.points,
            cost: this.cost,
            type: this.isPerWeek ? "Per Week" : "Per Term"
        };
    }
}

class ColumbiaPlan {
    constructor(name, meals, complimentary, diningDollars, flex, cost, isPerWeek) {
        this.name = name;
        this.meals = meals;
        this.complimentary = complimentary;
        this.diningDollars = diningDollars;
        this.flex = flex;
        this.cost = cost;
        this.isPerWeek = isPerWeek;
    }

    toDict() {
        return {
            name: this.name,
            meals: this.meals,
            complimentary: this.complimentary,
            diningDollars: this.diningDollars,
            flex: this.flex,
            cost: this.cost,
            type: this.isPerWeek ? "Per Week" : "Per Term"
        };
    }
}

const mealPrices = {
    Breakfast: 10,
    Lunch: 13,
    Dinner: 16,
    Brunch: 16
};

const columbiaPlans = [
    new ColumbiaPlan("Plan A / Weekly", 14, 21, 0, 200, 3137, true),
    new ColumbiaPlan("Plan A / Term", 210, 6, 100, 100, 3084, false),
    new ColumbiaPlan("Plan A / Meals", 210, 6, 0, 0, 2871, false),
    new ColumbiaPlan("Plan B / Dining Dollars", 175, 6, 100, 100, 2853, false),
    new ColumbiaPlan("Plan B / Flex", 175, 6, 0, 200, 2853, false),
    new ColumbiaPlan("Plan C", 150, 6, 75, 75, 2491, false),
    new ColumbiaPlan("Plan D", 100, 4, 0, 125, 1781, false),
    new ColumbiaPlan("EZ 18", 18, 21, 0, 100, 3541, true),
    new ColumbiaPlan("EZ 19", 19, 21, 75, 0, 3290, true),
    new ColumbiaPlan("EZ 350", 350, 21, 0, 150, 3591, false)
];

const barnardPlans = [
    new BarnardPlan("Platinum Plan", 19, 150, 4296, true),
    new BarnardPlan("Flex 150 Plan", 150, 625, 2949, false),
    new BarnardPlan("Flex 125 Plan", 125, 400, 2374, false),
    new BarnardPlan("Flex 75 Plan", 75, 200, 1350, false),
    new BarnardPlan("Flex 30 Plan", 30, 150, 624, false),
    new BarnardPlan("Convenience 500", 0, 500, 554, false)
];

function calculateOutOfPocketCost(mealCounts, mealPrices) {
    let totalCost = 0;
    let totalMeals = 0;
    Object.keys(mealCounts).forEach(meal => {
        totalCost += mealCounts[meal] * mealPrices[meal];
        totalMeals += mealCounts[meal];
    });
    const unitPrice = totalMeals > 0 ? totalCost / totalMeals : Infinity;
    return { totalMeals, totalCost, unitPrice };
}

function calculateTotalMeals(plan, mealPrices) {
    const isColumbia = plan instanceof ColumbiaPlan;
    const totalSwipeMeals = plan.meals + (isColumbia ? plan.complimentary : 0);
    const totalAssets = isColumbia ? (plan.diningDollars + plan.flex) : plan.points;
    const cheapestMealCost = Math.min(...Object.values(mealPrices));
    const mealsFromAssets = Math.floor(totalAssets / cheapestMealCost);

    return totalSwipeMeals + mealsFromAssets;
}


function evaluatePlans(plans, mealPrices) {
    return plans.filter(plan => !plan.isPerWeek).map(plan => {
        const totalMealsCovered = calculateTotalMeals(plan, mealPrices);
        const unitPrice = totalMealsCovered > 0 ? plan.cost / totalMealsCovered : Infinity;
        return { ...plan.toDict(), mealsCovered: totalMealsCovered, unitPrice };
    }).sort((a, b) => a.unitPrice - b.unitPrice);
}

document.getElementById('mealForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the default form submission
    console.log("Form submission intercepted.");  // Log when the form is submitted

    // Collect data from the form
    const mealCounts = {
        Breakfast: parseInt(document.getElementById('Breakfast').value, 10) || 0,
        Lunch: parseInt(document.getElementById('Lunch').value, 10) || 0,
        Dinner: parseInt(document.getElementById('Dinner').value, 10) || 0,
        Brunch: parseInt(document.getElementById('Brunch').value, 10) || 0
    };

    // Calculate results using local functions
    const outOfPocketResults = calculateOutOfPocketCost(mealCounts, mealPrices);
    const columbiaResults = evaluatePlans(columbiaPlans, mealPrices);
    const barnardResults = evaluatePlans(barnardPlans, mealPrices);

    // Display results
    displayResults(outOfPocketResults, columbiaResults, barnardResults);
});

function displayResults(outOfPocketResults, columbiaResults, barnardResults) {
    document.getElementById('resultsSection').style.display = 'block';  // Display the results section

    // Display Out-of-Pocket Results
    const outOfPocketDiv = document.getElementById('outOfPocketResults');
    outOfPocketDiv.innerHTML = `<h3>Out-of-Pocket Results</h3>
                                <p>Total Meals: ${outOfPocketResults.totalMeals}</p>
                                <p>Total Cost: $${outOfPocketResults.totalCost.toFixed(2)}</p>
                                <p>Cost per Meal: $${outOfPocketResults.unitPrice.toFixed(2)}</p>`;

    // Display Columbia Meal Plans
    const columbiaResultsDiv = document.getElementById('columbiaResults');
    columbiaResultsDiv.innerHTML = generateResultsTable("Columbia Meal Plans", columbiaResults);

    // Display Barnard Meal Plans
    const barnardResultsDiv = document.getElementById('barnardResults');
    barnardResultsDiv.innerHTML = generateResultsTable("Barnard Meal Plans", barnardResults);
}

function generateResultsTable(title, results) {
    let html = `<h3>${title}</h3><table>
                <tr>
                    <th>Plan Name</th>
                    <th>Meals</th>
                    <th>Cost</th>
                    <th>Meals Covered</th>
                    <th>Cost per Meal</th>
                </tr>`;
    results.forEach(plan => {
        html += `<tr>
                    <td>${plan.name}</td>
                    <td>${plan.meals}</td>
                    <td>$${plan.cost}</td>
                    <td>${plan.mealsCovered}</td>
                    <td>$${plan.unitPrice.toFixed(2)}</td>
                 </tr>`;
    });
    html += '</table>';
    return html;
}
