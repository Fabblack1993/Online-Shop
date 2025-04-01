async function loadDashboard() {
    try {
        const response = await fetch('/dashboard');
        const salesData = await response.json();

        // Remplir le tableau HTML
        const tbody = document.querySelector('#sales-table tbody');
        salesData.forEach(sale => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${sale.id}</td>
                <td>${sale.product}</td>
                <td>${sale.quantity}</td>
                <td>$${sale.revenue}</td>
            `;
            tbody.appendChild(row);
        });

        // Afficher un graphique avec Chart.js
        const ctx = document.getElementById('salesChart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: salesData.map(sale => sale.product),
                datasets: [{
                    label: 'Revenus ($)',
                    data: salesData.map(sale => sale.revenue),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
                }]
            }
        });
    } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
    }
}

loadDashboard();
