document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.faq-question').forEach(item => {
        item.addEventListener('click', () => {
            const answer = item.nextElementSibling;
            if (answer.style.display === 'block') {
                answer.style.display = 'none';
            } else {
                answer.style.display = 'block';
            }
        });
    });
});
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('mealForm').addEventListener('submit', function(event) {
        event.preventDefault();  // Prevent the default form submission
        console.log("Form submission intercepted.");  // Log when the form is submitted

        const formData = new FormData(this);
        console.log("Form data prepared for sending.");  // Log before sending the data

        fetch('/calculate', {
            method: 'POST',
            body: formData
        }).then(response => {
            console.log("Received response from server.");  // Log when response is received
            return response.json();
        }).then(data => {
            console.log("Data received:", data);  // Log the data received from the server

            if (data.error) {
                console.error('Error received:', data.error);  // Log and handle errors
                return;
            }

            document.getElementById('resultsSection').style.display = 'block';  // Display the results section

            // Display Out-of-Pocket Results
            const outOfPocketDiv = document.getElementById('outOfPocketResults');
            outOfPocketDiv.innerHTML = `<h3>Out-of-Pocket Results</h3>
                                    <p>Total Meals: ${data.total_meals}</p>
                                    <p>Total Cost: $${data.out_of_pocket_cost.toFixed(2)}</p>
                                    <p>Cost per Meal: $${data.out_of_pocket_unit.toFixed(2)}</p>`;

            // Process and display Columbia results
            const columbiaResultsDiv = document.getElementById('mealPlanResults');
            let columbiaHtml = `<h3>Columbia Meal Plans</h3>
                                <table>
                                    <tr>
                                        <th>Plan Name</th>
                                        <th>Meals</th>
                                        <th>Cost</th>
                                        <th>Meals Covered</th>
                                        <th>Cost per Meal</th>
                                    </tr>`;
            data.columbia_results.forEach(plan => {
                columbiaHtml += `<tr>
                                    <td>${plan.name}</td>
                                    <td>${plan.meals}</td>
                                    <td>$${plan.cost}</td>
                                    <td>${plan.meals_covered}</td>
                                    <td>$${plan.unit_price.toFixed(2)}</td>
                                 </tr>`;
            });
            columbiaHtml += '</table>';
            columbiaResultsDiv.innerHTML = columbiaHtml;
            console.log("Columbia meal plans displayed.");  // Log after displaying Columbia plans

            // Process and display Barnard results
            const barnardResultsDiv = document.createElement('div');
            let barnardHtml = `<h3>Barnard Meal Plans</h3>
                                <table>
                                    <tr>
                                        <th>Plan Name</th>
                                        <th>Meals</th>
                                        <th>Cost</th>
                                        <th>Meals Covered</th>
                                        <th>Cost per Meal</th>
                                    </tr>`;
            data.barnard_results.forEach(plan => {
                barnardHtml += `<tr>
                                    <td>${plan.name}</td>
                                    <td>${plan.meals}</td>
                                    <td>$${plan.cost}</td>
                                    <td>${plan.meals_covered}</td>
                                    <td>$${plan.unit_price.toFixed(2)}</td>
                                </tr>`;
            });
            barnardHtml += '</table>';
            barnardResultsDiv.innerHTML = barnardHtml;
            columbiaResultsDiv.appendChild(barnardResultsDiv);
            console.log("Barnard meal plans displayed.");  // Log after displaying Barnard plans
        }).catch(error => {
            console.error('Error during fetch operation:', error);  // Log fetch errors
        });
    });
});
