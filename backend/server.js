const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
let morgan
try { morgan = require('morgan') } catch (e) { morgan = null }
const cors = require('cors');
let cookieParser
try { cookieParser = require('cookie-parser') } catch (e) { cookieParser = null }
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/uploads');
const pingRoutes = require('./routes/ping');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');

connectDB();
const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
if (morgan) app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
if (cookieParser) app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ping', pingRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.send('HouseHunt API running'));

const { errorHandler } = require('./utils/handlers')
app.use(errorHandler)

if (process.env.NODE_ENV === 'production') {
	const clientDist = path.join(__dirname, 'frontend', 'dist')
	if (require('fs').existsSync(clientDist)) {
		app.use(express.static(clientDist))
		app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')))
	}
}

const PORT = process.env.PORT || 5000;
if (require.main === module) {
	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app
