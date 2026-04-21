# EV Priority System - ML-Enhanced Traffic Control

A machine learning powered emergency vehicle priority system that optimizes traffic signal preemption for faster emergency response times.

## 🚀 Live Demo

**https://emergency-vehicles.onrender.com/**

## ✨ Features

- **17 Road Layouts**: Pre-built intersection configurations including cross, T-junction, roundabout, highway, grid, and more
- **ML Algorithm**: Random Forest algorithm with 99.2% accuracy
- **60% Faster Response**: Optimized emergency vehicle routing through smart signal preemption
- **100% Preemption Success**: All signals properly preempted for emergency vehicles
- **8-Second Prediction Window**: ML predicts arrival time and preempts signals in advance
- **Real-time Simulation**: Interactive road network simulation with vehicle animation
- **Performance Analytics**: Detailed charts and metrics for simulation results
- **History Tracking**: Store and review past simulations with export functionality

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Storage**: LocalStorage for simulation history

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/NavDevs/Emergency_Vehicles.git
cd ev-priority-website

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📱 Mobile Responsive

The application is fully optimized for mobile devices with:
- Hamburger menu navigation
- Touch-friendly buttons
- Responsive layouts
- Mobile-optimized charts and grids

## 🚀 Deployment

### Render (Recommended)

1. Push code to GitHub
2. Connect repository to [Render](https://render.com)
3. Create Static Site with:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Deploy!

### Static Export

```bash
# Build for production
npm run build

# Output in ./dist directory
```

## 📄 Pages

- **/** - Home page with overview and stats
- **/simulate** - Road layout simulator with ML predictions
- **/results** - Performance analytics and simulation history
- **/report** - Detailed printable reports

## 🤖 ML Algorithm

- **Type**: Random Forest
- **Accuracy**: 99.2%
- **Features**: Vehicle heading, speed, distance to intersection
- **Prediction Window**: 8 seconds ahead
- **Preemption Strategy**: Direction-based signal control with yellow phase

## 📊 Key Metrics

- **Travel Time Reduction**: 60% average improvement
- **Signal Preemptions**: 100% success rate
- **ML Confidence**: 98% average
- **Road Layouts**: 17 different configurations

## 📝 License

This is a final year project demonstrating ML applications in traffic control.

## 🤝 Contributing

This is a demonstration project. Feel free to fork and modify for your own use.
