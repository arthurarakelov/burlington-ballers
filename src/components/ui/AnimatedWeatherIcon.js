import React from 'react';
import { Sun, Cloud, CloudRain, CloudDrizzle, CloudSnow, CloudLightning } from 'lucide-react';

const AnimatedWeatherIcon = ({ iconName, className = 'w-4 h-4' }) => {
  const getWeatherIcon = (iconName) => {
    const icons = {
      Sun: Sun,
      Cloud: Cloud,
      CloudRain: CloudRain,
      CloudDrizzle: CloudDrizzle,
      CloudSnow: CloudSnow,
      CloudLightning: CloudLightning
    };
    return icons[iconName] || Sun;
  };

  const getAnimationClass = (iconName) => {
    switch (iconName) {
      case 'Sun':
        return 'hover:animate-spin hover:duration-1000';
      case 'Cloud':
        return 'hover:animate-pulse';
      case 'CloudRain':
        return 'animate-pulse';
      case 'CloudDrizzle':
        return 'animate-pulse';
      case 'CloudSnow':
        return 'hover:animate-pulse';
      case 'CloudLightning':
        return 'animate-pulse';
      default:
        return 'hover:animate-pulse';
    }
  };

  const getColorClass = (iconName) => {
    switch (iconName) {
      case 'Sun':
        return 'text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]';
      case 'Cloud':
        return 'text-gray-400';
      case 'CloudRain':
        return 'text-blue-400';
      case 'CloudDrizzle':
        return 'text-blue-300';
      case 'CloudSnow':
        return 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]';
      case 'CloudLightning':
        return 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]';
      default:
        return 'text-gray-400';
    }
  };

  const WeatherIcon = getWeatherIcon(iconName);
  const animationClass = getAnimationClass(iconName);
  const colorClass = getColorClass(iconName);

  return (
    <WeatherIcon 
      className={`${className} ${animationClass} ${colorClass} transition-all duration-300`}
    />
  );
};

export default AnimatedWeatherIcon;