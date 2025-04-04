// Mobile navigation toggle
document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
    document.getElementById('main-nav').classList.toggle('active');
});

// Console functionality
const consoleOutput = document.getElementById('console-output');
const consoleInput = document.getElementById('console-input');
const sendButton = document.getElementById('send-command');

function addConsoleMessage(message, type = 'output') {
    const timestamp = new Date().toLocaleTimeString();
    consoleOutput.innerHTML += `\n> [${timestamp}] ${message}`;
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function processCommand(command) {
    if (!command) return;
    
    addConsoleMessage(`${command}`, 'input');
    
    // Simple command processor
    if (command.startsWith('help')) {
        addConsoleMessage('Available commands: help, list, connect, disconnect, monitor, send, clear');
    } else if (command.startsWith('clear')) {
        consoleOutput.innerHTML = '# IPC Debugger Console\n> Console cleared.';
    } else if (command.startsWith('list')) {
        addConsoleMessage('Active IPC mechanisms:');
        addConsoleMessage('- Pipe: process1 -> process2 (fd: 3, 4)');
        addConsoleMessage('- Queue: msgqueue1 (id: 12345)');
        addConsoleMessage('- SharedMem: segment1 (key: 0x1234)');
        addConsoleMessage('- Socket: unix:/tmp/socket1 (connected)');
    } else if (command.startsWith('connect')) {
        const parts = command.split(' ');
        if (parts.length > 1) {
            addConsoleMessage(`Connecting to ${parts[1]}...`);
            setTimeout(() => {
                addConsoleMessage(`Successfully connected to ${parts[1]}`, 'success');
                updateVisualizer();
            }, 800);
        } else {
            addConsoleMessage('Usage: connect [target]', 'error');
        }
    } else if (command.startsWith('send')) {
        const parts = command.split(' ');
        if (parts.length > 2) {
            const target = parts[1];
            const message = parts.slice(2).join(' ');
            addConsoleMessage(`Sending to ${target}: "${message}"`);
            animateDataTransfer();
        } else {
            addConsoleMessage('Usage: send [target] [message]', 'error');
        }
    } else {
        addConsoleMessage(`Unknown command: ${command}`, 'error');
        addConsoleMessage('Type "help" for available commands');
    }
}

sendButton.addEventListener('click', function() {
    const command = consoleInput.value.trim();
    processCommand(command);
    consoleInput.value = '';
});

consoleInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const command = consoleInput.value.trim();
        processCommand(command);
        consoleInput.value = '';
    }
});

// Visualizer functionality
const svg = document.getElementById('ipc-svg');
let simulationRunning = false;
let animationFrame = null;

function updateVisualizer() {
    // This would normally update the SVG based on real IPC data
    // For demo purposes, we'll just add a new process
    const processes = svg.querySelectorAll('.process');
    const newProcessId = processes.length + 1;
    
    const newProcess = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    newProcess.classList.add('process');
    newProcess.setAttribute('transform', `translate(${150 + Math.random() * 200}, ${300 + Math.random() * 100})`);
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', '40');
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.textContent = `Process ${newProcessId}`;
    
    newProcess.appendChild(circle);
    newProcess.appendChild(text);
    svg.appendChild(newProcess);
    
    // Add a connection to a random existing process
    const randomProcessIndex = Math.floor(Math.random() * processes.length);
    const targetProcess = processes[randomProcessIndex];
    
    const targetTransform = targetProcess.getAttribute('transform');
    const targetX = parseInt(targetTransform.split('(')[1].split(',')[0]);
    const targetY = parseInt(targetTransform.split(',')[1].split(')')[0]);
    
    const newTransform = newProcess.getAttribute('transform');
    const newX = parseInt(newTransform.split('(')[1].split(',')[0]);
    const newY = parseInt(newTransform.split(',')[1].split(')')[0]);
    
    const connection = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    connection.classList.add('channel');
    connection.setAttribute('d', `M${newX},${newY - 40} C${newX},${(newY + targetY)/2 - 50},${targetX},${(newY + targetY)/2 - 50},${targetX},${targetY + 40}`);
    
    svg.insertBefore(connection, svg.firstChild);
}

function animateDataTransfer() {
    const channels = svg.querySelectorAll('.channel');
    if (channels.length === 0) return;
    
    // Pick a random channel
    const randomChannelIndex = Math.floor(Math.random() * channels.length);
    const channel = channels[randomChannelIndex];
    
    // Create a data packet
    const packet = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    packet.classList.add('data-packet');
    packet.setAttribute('r', '8');
    svg.appendChild(packet);
    
    // Animate along the path
    let progress = 0;
    const speed = 0.01;
    
    function movePacket() {
        progress += speed;
        if (progress >= 1) {
            svg.removeChild(packet);
            addConsoleMessage('Data successfully transferred', 'success');
            return;
        }
        
        const path = channel;
        const pathLength = path.getTotalLength();
        const point = path.getPointAtLength(progress * pathLength);
        
        packet.setAttribute('cx', point.x);
        packet.setAttribute('cy', point.y);
        
        animationFrame = requestAnimationFrame(movePacket);
    }
    
    movePacket();
}

document.getElementById('start-simulation').addEventListener('click', function() {
    if (!simulationRunning) {
        simulationRunning = true;
        addConsoleMessage('Starting IPC simulation...');
        
        function simulationStep() {
            if (!simulationRunning) return;
            
            const speed = parseFloat(document.getElementById('simulation-speed').value);
            const randDelay = (2000 / speed) + Math.random() * (3000 / speed);
            
            setTimeout(() => {
                addConsoleMessage('New IPC event detected');
                animateDataTransfer();
                simulationStep();
            }, randDelay);
        }
        
        simulationStep();
    }
});

document.getElementById('pause-simulation').addEventListener('click', function() {
    simulationRunning = false;
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
    addConsoleMessage('Simulation paused');
});

document.getElementById('step-simulation').addEventListener('click', function() {
    addConsoleMessage('Executing single simulation step');
    animateDataTransfer();
});

document.getElementById('apply-settings').addEventListener('click', function() {
    const processCount = document.getElementById('process-count').value;
    const ipcType = document.getElementById('ipc-type').value;
    const bufferSize = document.getElementById('buffer-size').value;
    const messageRate = document.getElementById('message-rate').value;
    
    addConsoleMessage(`Applying settings: ${processCount} processes, ${ipcType}, buffer=${bufferSize}B, rate=${messageRate}msg/s`);
    
    // This would normally update the simulation parameters
    // For demo purposes, we'll just update the visualizer
    updateVisualizer();
});

// Initialize with a sample command
setTimeout(() => {
    processCommand('list');
}, 1000);