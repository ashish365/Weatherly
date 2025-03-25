# Weather Dashboard

A responsive React application that allows users to track weather conditions across multiple cities with an interactive map interface.

## Features

- Add up to 10 cities to track their weather conditions
- View current weather data including temperature, humidity, wind speed, and conditions
- See 5-day weather forecasts for each city
- Interactive map showing the location of selected cities
- Drag and drop interface to reorder cities
- Persistent storage of city preferences using local storage
- Loading states with skeleton UI
- Error handling for invalid city names or API issues

## Technologies Used

- React with TypeScript
- Styled Components for styling
- Material UI for skeleton loaders
- Pigeon Maps for the interactive map component
- Custom hooks for data fetching and state management
- Local storage for data persistence

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/Weatherly.git
   cd weather-dashboard
   ```

2. Install dependencies:

   ```
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory and add your OpenWeatherMap API key:

   ```
   REACT_APP_OPENWEATHER_API_KEY=your_api_key_here
   ```

   You can get a free API key by signing up at [OpenWeatherMap](https://openweathermap.org/api).

4. Start the development server:

   ```
   npm start
   # or
   yarn start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Solution Approach

### Architecture

The application follows a component-based architecture with custom hooks for data fetching and state management:

1. **Component Structure**:

   - `WeatherDashboard`: Main component that orchestrates the entire application
   - `ErrorFallback`: Displays error messages
   - Various styled components for UI elements

2. **Custom Hooks**:
   - `useWeatherData`: Fetches and manages weather and forecast data
   - `useCityCoords`: Handles city coordinates for the map
   - `useLocalStorage`: Provides persistent storage

### Key Implementation Details

- **City Management**: Users can add, remove, and reorder cities using drag and drop
- **Data Fetching**: Weather data is fetched from OpenWeatherMap API
- **Error Handling**: Comprehensive error handling for API failures and validation
- **Loading States**: Skeleton UI components display while data is loading
- **Responsive Design**: The dashboard adapts to different screen sizes
- **Performance Optimization**: Minimum loading times and efficient state updates

### Data Flow

1. User adds a city name
2. Application validates the city name
3. Weather data is fetched from the API
4. UI updates to display the weather information
5. City preferences are saved to local storage

## Deployment

The application can be built for production using:

```
npm run build
# or
yarn build
```

This creates an optimized production build in the `build` folder that can be deployed to any static hosting service like Netlify, Vercel, or GitHub Pages.

### Run the container locally:

```
docker run -p 8080:80 weather-dashboard:latest
```
