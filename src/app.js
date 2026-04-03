const express = require('express');
const app = express();

app.use(express.json());

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/records',   require('./routes/records'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(3000, () => console.log('Server running on port 3000'));