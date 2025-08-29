import { useEffect, useState } from 'react';

const WesMode = ({ user, children }) => {
  const [wesSlangVisible, setWesSlangVisible] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const wesSlang = [
    "Yea-Yea!",
    "Irish Spring Green!",
    "Top of the key!",
    "Buckets!",
    "And-1!",
    "I'm a DAWG!",
    "4%",
    "WesWorld4",
    "Its like an 8.9",
    "I love pizza"
  ];

  const wesImages = [
    "https://i.ytimg.com/vi/zynIW9mwIVI/oardefault.jpg?sqp=-oaymwEoCJUDENAFSFqQAgHyq4qpAxcIARUAAIhC2AEB4gEKCBgQAhgGOAFAAQ==&rs=AOn4CLAKzVB2iC09MvqflE6laKtYctWt7A",
    "https://i.ytimg.com/vi/ITE1f_ZMsD8/oar2.jpg?sqp=-oaymwEoCJUDENAFSFqQAgHyq4qpAxcIARUAAIhC2AEB4gEKCBgQAhgGOAFAAQ==&rs=AOn4CLBiEWLscYUSWMwoexy21qlQgHd9IQ",
    "https://i.ytimg.com/vi/7bzz_qNOToc/oardefault.jpg?sqp=-oaymwEoCJUDENAFSFqQAgHyq4qpAxcIARUAAIhC2AEB4gEKCBgQAhgGOAFAAQ==&rs=AOn4CLAUN5sd9VB2txKM-Hj2HziWE3YO6A",
    "https://i.ytimg.com/vi/oNW5QswSCxc/oar2.jpg?sqp=-oaymwEoCJUDENAFSFqQAgHyq4qpAxcIARUAAIhC2AEB4gEKCBgQAhgGOAFAAQ==&rs=AOn4CLCRGEdCleoywEMGwgvkHw8Sw3MknQ",
    "https://i.ytimg.com/vi/o5dKaUMRbGA/oardefault.jpg?sqp=-oaymwEoCJUDENAFSFqQAgHyq4qpAxcIARUAAIhC2AEB4gEKCBgQAhgGOAFAAQ==&rs=AOn4CLAvzqCgJEUh9tiCROHSEK8_igVgqw",
    "https://i.ytimg.com/vi/lOyDy1TSMr0/oardefault.jpg?sqp=-oaymwEoCJUDENAFSFqQAgHyq4qpAxcIARUAAIhC2AEB4gEKCBgQAhgGOAFAAQ==&rs=AOn4CLAJcE5UtfEpCLYRiMZn7DiGKjGIbA",
    "https://i.ytimg.com/vi/DTGqWYz5kp0/oar2.jpg?sqp=-oaymwEoCJUDENAFSFqQAgHyq4qpAxcIARUAAIhC2AEB4gEKCBgQAhgGOAFAAQ==&rs=AOn4CLCD3-5t3ZPA3IcvJloBNHtGVV5CDg",
    "https://i.ytimg.com/vi/N88LygMwjeM/oar2.jpg?sqp=-oaymwEoCJUDENAFSFqQAgHyq4qpAxcIARUAAIhC2AEB4gEKCBgQAhgGOAFAAQ==&rs=AOn4CLCVKqtkgpgcBlLuuSdwKR0a98vMcA",
    "https://i.ytimg.com/vi/JLH2YnsZNVo/oardefault.jpg?sqp=-oaymwEoCJUDENAFSFqQAgHyq4qpAxcIARUAAIhC2AEB4gEKCBgQAhgGOAFAAQ==&rs=AOn4CLBK8uPGjHmpvD5tt8qZSzeq40YgoQ",
    "https://i.ytimg.com/vi/hSsNkoy5IFo/oardefault.jpg?sqp=-oaymwEoCJUDENAFSFqQAgHyq4qpAxcIARUAAIhC2AEB4gEKCBgQAhgGOAFAAQ==&rs=AOn4CLBoVQwf0VVqmxYLi-O2yfcnHvUJvQ",
    "https://i.ytimg.com/vi/whgutCCZMuw/oar2.jpg?sqp=-oaymwEoCJUDENAFSFqQAgHyq4qpAxcIARUAAIhC2AEB4gEKCBgQAhgGOAFAAQ==&rs=AOn4CLCf9A-SymWqRqDMcKKv35B4AsTooA",
    "https://i.ytimg.com/vi/LWeekFYMf64/oardefault.jpg?sqp=-oaymwEoCJUDENAFSFqQAgHyq4qpAxcIARUAAIhC2AEB4gEKCBgQAhgGOAFAAQ==&rs=AOn4CLA36ClyDOtHnYgmixrVkU7EPSXVlA",
    "https://i.ytimg.com/vi/jdDeThqev_8/oardefault.jpg?sqp=-oaymwEoCJUDENAFSFqQAgHyq4qpAxcIARUAAIhC2AEB4gEKCBgQAhgGOAFAAQ==&rs=AOn4CLBvMEao5V8UuBBxDL_Pt8OPfdjyHQ",
    "https://i.ytimg.com/vi/CpbGrXEujDY/oardefault.jpg?sqp=-oaymwEoCJUDENAFSFqQAgHyq4qpAxcIARUAAIhC2AEB4gEKCBgQAhgGOAFAAQ==&rs=AOn4CLAh3eUElqczg0iY_XmoihfVFxDK6A",
    "https://i.ytimg.com/vi/WW02wNWbWCM/oar2.jpg?sqp=-oaymwEoCJUDENAFSFqQAgHyq4qpAxcIARUAAIhC2AEB4gEKCBgQAhgGOAFAAQ==&rs=AOn4CLBqN8bG_E4T3hybCHKNCx3e64IRtA",
    "https://i.ytimg.com/vi/h9vyfLHtYRs/oar2.jpg?sqp=-oaymwEoCJUDENAFSFqQAgHyq4qpAxcIARUAAIhC2AEB4gEKCBgQAhgGOAFAAQ==&rs=AOn4CLBbWKC5zDEIjMYCI2ukORDCFt7xjw"
  ];

  const triggerWesSlang = () => {
    if (!user?.wesMode) return;
    
    const randomSlang = wesSlang[Math.floor(Math.random() * wesSlang.length)];
    const id = Date.now() + Math.random();
    
    setWesSlangVisible(prev => [...prev, { id, text: randomSlang }]);
    
    // Remove after animation
    setTimeout(() => {
      setWesSlangVisible(prev => prev.filter(item => item.id !== id));
    }, 3000);
  };

  // Random slang drops when in Wes Mode - MORE FREQUENT!
  useEffect(() => {
    if (!user?.wesMode) return;
    
    const interval = setInterval(() => {
      if (Math.random() < 0.7) { // 70% chance every 1.5 seconds
        triggerWesSlang();
      }
    }, 1500); // Faster drops
    
    return () => clearInterval(interval);
  }, [user?.wesMode]);

  // Rotate background images every 5 seconds in Wes Mode
  useEffect(() => {
    if (!user?.wesMode) return;
    
    const imageRotateInterval = setInterval(() => {
      setCurrentImageIndex(prev => {
        const newIndex = (prev + 1) % wesImages.length;
        return newIndex;
      });
    }, 5000); // Change image every 5 seconds
    
    return () => clearInterval(imageRotateInterval);
  }, [user?.wesMode, wesImages.length]);



  if (!user?.wesMode) {
    return children;
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Force Visible Background Image */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: `url('${wesImages[currentImageIndex]}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.4,
          zIndex: 5,
          filter: 'sepia(0.6) hue-rotate(25deg) saturate(2) brightness(1.2) contrast(1.1)',
          transition: 'background-image 1s ease-in-out',
          pointerEvents: 'none'
        }}
      />

      {/* Floating Wes Slang */}
      {wesSlangVisible.map(item => (
        <div
          key={item.id}
          className="fixed pointer-events-none animate-bounce"
          style={{
            zIndex: 50,
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 60 + 20}%`,
            fontSize: `${Math.random() * 20 + 20}px`,
            fontFamily: 'Impact, Arial Black, sans-serif',
            color: '#ff6b35',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            transform: `rotate(${Math.random() * 40 - 20}deg)`,
            animation: `wesSlangDrop 3s ease-out forwards`
          }}
        >
          {item.text}
        </div>
      ))}
      
      {/* Modified Children with Orange Theme */}
      <div className={user.wesMode ? 'wes-mode-active' : ''} style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default WesMode;