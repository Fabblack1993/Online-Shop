import express from "express";
import dotenv from "dotenv";
import Stripe from "stripe";



dotenv.config(); // Charger les variables d'environnement

const stripe = new Stripe(process.env.STRIPE_API_KEY); // Initialisation de Stripe
const app = express();
const getSalesData = async () => {
    // Simule des données de vente (à remplacer par une base de données réelle)
    return [
        { id: 1, product: "Parfum", quantity: 10, revenue: 150 },
        { id: 2, product: "Accessoires", quantity: 5, revenue: 75 },
        { id: 3, product: "Cosmétiques", quantity: 20, revenue: 300 }
    ];
};

app.use(express.static('public'));
app.use(express.json());

// Route page d'accueil
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public'});
});

app.get('/success', (req, res) => {
    res.sendFile('success.html', { root: 'public'});
});

app.get('/cancel', (req, res) => {
    res.sendFile('cancel.html', { root: 'public'});
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Exemple basique de validation (remplace avec une base de données sécurisée)
    if (username === 'admin' && password === 'C@brelle2017') {
        res.redirect('/dashboard.html'); // Redirige vers le tableau de bord
    } else {
        res.status(401).send("Nom d'utilisateur ou mot de passe incorrect");
    }
});

//app.get('/dashboard', (req, res) => {
    //res.sendFile('dashboard.html', { root: 'public' });//
//}//);///

// Stripe : Création d'une session de paiement

app.get('/dashboard', (req, res) => {
    const salesData = [
        { id: 1, product: "Parfum", quantity: 10, revenue: 150 },
        { id: 2, product: "Accessoires", quantity: 5, revenue: 75 },
        { id: 3, product: "Cosmétiques", quantity: 20, revenue: 300 }
    ];
    res.json(salesData);
});


app.post('/stripe-checkout', async (req, res) => {
    try {
        const items = req.body.items;
        if (!items || items.length === 0) {
            return res.status(400).send("No items in cart");
        }

        const lineItems = items.map(item => {
            // Vérifie si l'image est une URL publique ou remplace par une image par défaut
            const imageUrl = item.productImg.startsWith('http')
                ? item.productImg
                : 'https://via.placeholder.com/150'; // Image par défaut

            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.title,
                        images: [imageUrl], // Utilise l'image vérifiée
                    },
                    unit_amount: parseInt(item.price.replace('$', '')) * 100,
                },
                quantity: item.quantity,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.DOMAIN}/success`,
            cancel_url: `${process.env.DOMAIN}/cancel`,
        });

        res.json(session.url); // Retourne l'URL de Stripe
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating Stripe session");
    }
});

// Lancement du serveur
app.listen(3000, () => {
    console.log('Listening on port 3000');
});
