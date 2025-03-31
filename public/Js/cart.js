
const payBtn = document.querySelector('.btn-buy');

payBtn.addEventListener('click', () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems'));

    fetch('/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems }),
    })
        .then(res => {
            if (!res.ok) {
                throw new Error('Failed to create Stripe session');
            }
            return res.json();
        })
        .then(url => {
            window.location.href = url; // Redirige vers Stripe
        })
        .catch(err => {
            console.error('Error:', err);
            alert('An error occurred during the payment process');
        });
});


