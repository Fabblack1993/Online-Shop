import express from "express";
import dotenv from "dotenv";
import Stripe from "stripe";

// Chargement des variables d'environnement
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_API_KEY); // Initialisation de Stripe
const app = express();

// Configuration du middleware
app.use(express.static('public')); // Sert les fichiers statiques
app.use(express.json()); // Parse les données JSON envoyées dans les requêtes
app.use(express.urlencoded({ extended: true })); // Parse les données des formulaires HTML

// Route principale
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public' }); // Sert la page d'accueil
});

// Route de succès
app.get('/success', (req, res) => {
    res.sendFile('success.html', { root: 'public' }); // Sert la page de succès
});

// Route d'annulation
app.get('/cancel', (req, res) => {
    res.sendFile('cancel.html', { root: 'public' }); // Sert la page d'annulation
});

// Route de connexion
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    console.log("Requête reçue : ", req.body);

    // Vérification des identifiants
    if (username === 'Fabienne_Admin2025' && password === 'Xq&9@2bRp#4!') {
        console.log("Connexion réussie !");
        res.redirect('/dashboard.html'); // Redirige vers le tableau de bord
    } else {
        console.error("Échec de connexion : Identifiants incorrects !");
        res.status(401).send("Nom d'utilisateur ou mot de passe incorrect");
    }
});

// Route pour fournir les données analytiques
app.get('/api/dashboard', (req, res) => {
    const salesData = [
        { id: 1, product: "Parfum", quantity: 10, revenue: 150 },
        { id: 2, product: "Accessoires", quantity: 5, revenue: 75 },
        { id: 3, product: "Cosmétiques", quantity: 20, revenue: 300 },
    ];
    res.json(salesData); // Renvoie les données en JSON
});

// Route pour gérer le checkout Stripe
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

// Démarrage du serveur
app.listen(3000, () => {
    console.log('Listening on port 3000');
});
