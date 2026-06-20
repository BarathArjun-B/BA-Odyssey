const fs = require('fs');

function replaceFile(path, replacer) {
  let content = fs.readFileSync(path, 'utf8');
  content = replacer(content);
  fs.writeFileSync(path, content);
}

// 1. DriftingStarLayer.jsx
replaceFile('/Users/baratharjun/Desktop/BA/src/components/cosmic/DriftingStarLayer.jsx', content => {
  return content.replace(/const stars = useMemo\(\(\) => \{[\s\S]*?\}, \[starCount\]\);/, `const stars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < starCount; i++) {
      const isX = (i % 2) === 0;
      arr.push({
        id: i,
        top: ((i * 13) % 100) + '%',
        left: ((i * 29) % 100) + '%',
        size: (((i * 7) % 20) / 10 + 1) + 'px',
        animationClass: isX ? 'animate-[driftX_40s_ease-in-out_infinite]' : 'animate-[driftY_40s_ease-in-out_infinite]',
        delay: -1 * ((i * 31) % 40) + 's',
        duration: ((i * 17) % 40) + 40 + 's',
        opacity: (((i * 11) % 40) / 100) + 0.2,
      });
    }
    return arr;
  }, [starCount]);`);
});

// 2. StarFieldLayer.jsx
replaceFile('/Users/baratharjun/Desktop/BA/src/components/cosmic/StarFieldLayer.jsx', content => {
  return content.replace(/const starShadows = useMemo\(\(\) => \{[\s\S]*?\}, \[starCount\]\);/, `const starShadows = useMemo(() => {
    let shadows = [];
    for (let i = 0; i < starCount; i++) {
      const x = (i * 137) % 100;
      const y = (i * 93) % 100;
      const alpha = (((i * 17) % 50) / 100 + 0.1).toFixed(2);
      shadows.push(\`\${x}vw \${y}vh rgba(255, 255, 255, \${alpha})\`);
    }
    return shadows.join(', ');
  }, [starCount]);`);
});

// 3. TwinkleStarLayer.jsx
replaceFile('/Users/baratharjun/Desktop/BA/src/components/cosmic/TwinkleStarLayer.jsx', content => {
  return content.replace(/const stars = useMemo\(\(\) => \{[\s\S]*?\}, \[starCount\]\);/, `const stars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < starCount; i++) {
      arr.push({
        id: i,
        top: ((i * 47) % 100) + '%',
        left: ((i * 73) % 100) + '%',
        size: (((i * 13) % 15) / 10 + 0.5) + 'px',
        delay: ((i * 19) % 50) / 10 + 's',
        duration: ((i * 23) % 30) / 10 + 3 + 's',
      });
    }
    return arr;
  }, [starCount]);`);
});

// 4. StarSystemCell.jsx
replaceFile('/Users/baratharjun/Desktop/BA/src/components/cosmic/StarSystemCell.jsx', content => {
  return content.replace(/animationDelay: \`\$\{Math\.random\(\) \* -4\}s\`/, `animationDelay: \`\$\{((score * 1.37) % 4) * -1\}s\``);
});

// 5. GalaxyCard.jsx - unused idea
replaceFile('/Users/baratharjun/Desktop/BA/src/components/cosmic/GalaxyCard.jsx', content => {
  return content.replace(/export default function GalaxyCard\(\{ idea, children, index = 0 \}\)/, `export default function GalaxyCard({ children, index = 0 })`);
});

// 6. ThemeContext.jsx - no-undef setTheme
replaceFile('/Users/baratharjun/Desktop/BA/src/context/ThemeContext.jsx', content => {
  return content.replace(/const setThemePref = \(newTheme\) => \{\s*setTheme\(newTheme\);\s*updateSettings\(\{ theme: newTheme \}\);\s*\};/, `const setThemePref = (newTheme) => { updateSettings({ theme: newTheme }); };`);
});

// 7. Dashboard.jsx - unused useEffect
replaceFile('/Users/baratharjun/Desktop/BA/src/pages/Dashboard/Dashboard.jsx', content => {
  return content.replace(/import \{ useMemo, useState, useEffect \} from 'react';/, `import { useMemo, useState } from 'react';`);
});

