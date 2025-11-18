@tailwind base;
@tailwind components;
@tailwind utilities;

@keyframes spin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
@keyframes wiggle {
    0%{transform:translateX(0)} 20%{transform:translateX(-2px)}
    40%{transform:translateX(2px)} 60%{transform:translateX(-2px)}
    80%{transform:translateX(2px)} 100%{transform:translateX(0)}
}

@layer utilities {
    .animate-wiggle { animation: wiggle 0.2s ease; }
    .animate-spin-fast { animation: spin 0.5s linear; }
}
