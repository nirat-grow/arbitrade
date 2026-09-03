const fs = require('fs');
const content = fs.readFileSync('c:/Bot design/ui bot/frontend/src/index.css', 'utf8');

const target = 
.chart-fill-space {
    margin-top: auto; 
    display: flex;
}
.circle-label {
.trim();

const replacement = 
.chart-fill-space {
    margin-top: auto; 
    display: flex;
    align-items: center;
    gap: 24px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 16px 24px;
}
.circle-chart-container {
    position: relative;
    width: 100px;
    height: 100px;
}
.circle-chart-container.animate .circle-bg {
    animation: spinScanner 30s linear infinite;
    transform-origin: 50% 50%;
}
@keyframes spinScanner {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.circle-bg {
    fill: none;
    stroke: rgba(255, 255, 255, 0.05);
    stroke-width: 6;
    stroke-dasharray: 2 6;
}
.circle-progress {
    fill: none;
    stroke: #FFDF00;
    stroke-width: 6;
    stroke-linecap: round;
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
    transition: stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
}
.circle-chart-container.animate .circle-progress {
    animation: pulseGlow 3s infinite ease-in-out;
}
@keyframes pulseGlow {
    0%, 100% { filter: drop-shadow(0 0 4px rgba(255, 223, 0, 0.4)); }
    50% { filter: drop-shadow(0 0 12px rgba(255, 223, 0, 0.8)); }
}
.circle-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
}
.circle-score {
    color: #FFF;
    font-size: 1.1rem;
    font-family: var(--font-mono);
    font-weight: 700;
}
.circle-label {
.trim();

fs.writeFileSync('c:/Bot design/ui bot/frontend/src/index.css', content.replace(target, replacement));
console.log('Fixed CSS!');
