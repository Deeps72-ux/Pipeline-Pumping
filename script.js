const inValve = document.querySelector("#inlet-valve");
const outValve = document.querySelector("#outlet-valve");
const fluidInlet = document.querySelector("#fluid-inlet");
const fluidOutlet = document.querySelector("#fluid-outlet");
const pumpWheel = document.querySelector(".pump-wheel");

fluidInlet.style.transition= "width 5s linear";
fluidOutlet.style.transition= "width 2s linear";

let isInDraining = false;
let isOutDraining = false;
let isInletValveOpen = false;
let isOutletValveOpen = false;
let isPumpOn = false;
let haltPump=false;
let isInletFill = false;
let isOutletFill = false;

// Initialize the display
updateStatus();

setInterval(() => {
    updateStatus(); // Call updateStatus to refresh the display
}, 5000);


// Toggle valve state
function toggleColor(valve, isOpen) {
if(isOpen){ 
 // Step 1: Change to yellow
 valve.style.setProperty('--valve-color', 'yellow');

 // Step 2: Change to green after 1 second
 setTimeout(() => {
   valve.style.setProperty('--valve-color', 'green');
 }, 1000);
}

else{ 
// Step 1: Change to yellow
valve.style.setProperty('--valve-color', 'yellow');

// Step 2: Change to red after 1 second
setTimeout(() => {
  valve.style.setProperty('--valve-color', 'red');
}, 1000);
}
  
}

// Left Valve Controls
function InletValveToggle() {
    if(isInDraining && !isInletValveOpen)
    {
        alert("Inlet Drain in progress ! \nInlet valve cannot be opened");
        return;
    }
    isInletValveOpen = !isInletValveOpen;  // Toggle the state
    if(isInletValveOpen)
    fluidInlet.style.width = "100%"; // Fill the entire pipeline
    
    if(isInletValveOpen==false)
    stopPump();

    toggleColor(inValve, isInletValveOpen); 
    checkFluidFlow();
}

// Right Valve Controls
function OutletValveToggle() {
    if(isOutDraining && !isOutletValveOpen)
    {
        alert("Outlet Drain in progress ! \nOutlet valve cannot be opened");
        return;
    }
    isOutletValveOpen = !isOutletValveOpen;  // Toggle the state
    if(isOutletValveOpen==false)
    stopPump();
    toggleColor(outValve, isOutletValveOpen);
    checkFluidFlow(); // Check if fluid should flow
}

// Pump Controls
function startPump() {
  
    if (isInletValveOpen && isInletFill && !isInDraining && !isOutDraining ) {
        isPumpOn = true;
        haltPump=false;
        pumpWheel.style.animation = "spin 2s linear infinite"; 
        if(isOutletValveOpen==false)
        OutletValveToggle();
        pumpWheel.style.backgroundColor = "yellow";
        setTimeout(() => {
            pumpWheel.style.backgroundColor = "blue";
          }, 1000);
        checkFluidFlow();
    } else {
        alert("Not ready to start!");
        return;
    }

}

function stopPump() {
    isPumpOn = false;
    haltPump=true;
    pumpWheel.style.animationPlayState = "paused";
    if(isOutletValveOpen)
    OutletValveToggle();
    const currentWidth = window.getComputedStyle(fluidOutlet).width;
    fluidOutlet.style.transition = "none"; // Stop smooth transition
    fluidOutlet.style.width = currentWidth; // Maintain current width
    checkFluidFlow();
}
function DrainInletLine(){
    stopPump();
    isInDraining=true;
    if(isInletValveOpen)
    InletValveToggle();
    pumpWheel.style.backgroundColor = "orange";
    fluidInlet.style.transition= "width 5s linear";
    setTimeout(() => {
        fluidInlet.style.width = "40px"; // empty the entire pipeline
    }, 5000);
    fluidInlet.addEventListener("transitionend", () => {
        isInletFill=false;
        isInDraining=false;
        alert("Inlet line Drained");
    }, { once: true });
   
   checkFluidFlow();
}
function DrainOutletLine(){
    stopPump();
    isOutDraining=true;
    if(isOutletValveOpen)
    OutletValveToggle();
    fluidOutlet.style.transition= "width 5s linear";
    setTimeout(() => {
        fluidOutlet.style.width = "0%"; // empty the entire pipeline
        fluidOutlet.style.left="auto";
        fluidOutlet.style.right=0;
        alert("Outlet width: "+fluidOutlet.style.width);
    }, 5000);

    fluidOutlet.addEventListener("transitionend", () => {
        isOutletFill=false;
        isOutDraining=false;
        alert("Outlet line Drained");
    }, { once: true });
   checkFluidFlow();
}
// Check Fluid Flow
function checkFluidFlow() {
    if (isInletValveOpen && isInletFill==false) {
        setTimeout(() => {
            fluidInlet.style.width = "100%"; // Fill the entire pipeline
        }, 5000);
        fluidInlet.addEventListener("transitionend", () => {
            isInletFill=true;
            alert("Inlet line Charged");
        }, { once: true });
    }  
    if(isInletValveOpen && isOutletValveOpen && isPumpOn) {

        fluidOutlet.style.left=0;
        fluidOutlet.style.right = "auto"; 
        let currentWidth = parseFloat(window.getComputedStyle(fluidOutlet).width); // Get numeric width
        const interval = setInterval(() => {
            if(haltPump) return;
            if (currentWidth == 270 && !haltPump) {
                clearInterval(interval); // Stop the loop when the fluid is filled
                isOutletFill = true;
            } else {
                currentWidth += 1; // increase width (adjust as needed for smoothness)
                fluidOutlet.style.width = currentWidth + "px"; // Update fluid width
            }
        }, 50); // Adjust interval timing as needed
    
    }
   
}




// Function to update the status display
function updateStatus() {
    const inletValveStatus = document.getElementById("inlet-valve-status");
    const outletValveStatus = document.getElementById("outlet-valve-status");
    const inletLineStatus = document.getElementById("inlet-line-status");
    const outletLineStatus = document.getElementById("outlet-line-status");
    const inletDrainStatus = document.getElementById("inlet-drain-status");
    const outletDrainStatus = document.getElementById("outlet-drain-status");

    // Update inlet valve status
    if (isInletValveOpen) {
        inletValveStatus.textContent = "Inlet Valve : Open";
        inletValveStatus.className = "status-block open";
    } else {
        inletValveStatus.textContent = "Inlet Valve : Closed";
        inletValveStatus.className = "status-block closed";
    }

    // Update outlet valve status
    if (isOutletValveOpen) {
        outletValveStatus.textContent = "Outlet Valve : Open";
        outletValveStatus.className = "status-block open";
    } else {
        outletValveStatus.textContent = "Outlet Valve : Closed";
        outletValveStatus.className = "status-block closed";
    }

    if (isInletFill) {
        inletLineStatus.textContent = "Inlet Line : Filled";
        inletLineStatus.className = "status-block open";
    } else {
        inletLineStatus.textContent = "Inlet Line : Drained";
        inletLineStatus.className = "status-block closed";
    }

    if (isOutletFill) {
        outletLineStatus.textContent = "Outlet Line : Filled";
        outletLineStatus.className = "status-block open";
    } else {
        outletLineStatus.textContent = "Outlet Line : Drained";
        outletLineStatus.className = "status-block closed";}

    if (isInDraining) {
        inletDrainStatus.textContent = "Inlet Line Draining? : Yes";
        inletDrainStatus.className = "status-block open";
    } else {
        inletDrainStatus.textContent = "Inlet Line Draining? : No";
        inletDrainStatus.className = "status-block closed";
    if (isOutDraining) {
        outletDrainStatus.textContent = "Outlet Line Draining? : Yes";
        outletDrainStatus.className = "status-block open";
    } else {
        outletDrainStatus.textContent = "Outlet Line Draining : No";
        outletDrainStatus.className = "status-block closed";
    }

    if(isOutDraining && isOutletFill)
    DrainOutletLine();

    if(isInDraining && isInletFill)
    DrainInletLine();
}


}

