const inValve = document.querySelector("#inlet-valve");
const outValve = document.querySelector("#outlet-valve");
const fluidInlet = document.querySelector("#fluid-inlet");
const fluidOutlet = document.querySelector("#fluid-outlet");
const pumpWheel = document.querySelector(".pump-wheel");
const tankFluid = document.getElementById("tank-fluid");
const outletdrain=document.querySelector("#drain-pipe-outlet");

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

// Initialize the PV(Process Variables) display
updateStatus();

setInterval(() => {
    updateStatus(); // Call updateStatus to refresh the display
}, 5000);


// Valve color transitions
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

// Inlet Valve Controls
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

// Outlet Valve Controls
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
const bgMusic = document.getElementById("background-music");

function startPump() {
    if(isPumpOn)
    return;
  
    if (isInletValveOpen && isInletFill && !isInDraining && !isOutDraining ) {
        isPumpOn = true;
        tankFluid.style.height = `${0}%`; // Set height based on percentage
        //power load started
        togglePower(true); 
        haltPump=false;
        //pump starting musics
        bgMusic.volume = 1.0; // Set volume (0.0 to 1.0)
        bgMusic.loop = true; // Enable looping
        bgMusic.play(); // Play music
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
    //power load stopped
    togglePower(false);
    bgMusic.pause(); // Pause music
    haltPump=true;
    pumpWheel.style.animationPlayState = "paused";
    if(isOutletValveOpen)
    OutletValveToggle();
    const currentWidth = window.getComputedStyle(fluidOutlet).width;
    fluidOutlet.style.transition = "none"; // Stop smooth transition
    fluidOutlet.style.width = currentWidth; // Maintain current width
    checkFluidFlow();
}
// Function to toggle pump and display power icon
function togglePower(isPumpOn) {
    const powerIcon = document.getElementById("power-icon");

    if (isPumpOn) {
        // Turn on pump and show lightning
        powerIcon.style.visibility = "visible";
    } else {
        // Turn off pump and hide lightning
        powerIcon.style.visibility = "hidden";
    }
}

//Drain System
function DrainInletLine(){
    stopPump();
    isInDraining=true;
    if(isInletValveOpen)
    InletValveToggle();
    pumpWheel.style.backgroundColor = "orange";
    fluidInlet.style.transition= "width 5s linear";
    let currentWidthBeforeDraining = fluidInlet.offsetWidth; // Get the current width in pixels
    setTimeout(() => {
        fluidInlet.style.width = "40px"; // empty the entire pipeline
    }, 5000);
    fluidInlet.addEventListener("transitionend", () => {
        let percentageBeforeDraining = (currentWidthBeforeDraining / fluidInlet.parentElement.offsetWidth) * 50;
        updateTankFluidLevel(percentageBeforeDraining); // Update tank fluid level based on previous width percentage
        alert("%drained is "+percentageBeforeDraining);     
        isInletFill=false;
        isInDraining=false;
        alert("Inlet line Drained");
    }, { once: true });
   
   checkFluidFlow();
}

//Outlet draining mechanism
function DrainOutletLine(){
    stopPump();
    isOutDraining=true;
    outletdrain.style.backgroundColor="blue";
    let currentWidthBeforeDraining = fluidOutlet.offsetWidth; // Get the current width in pixels
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
        let percentageBeforeDraining = (currentWidthBeforeDraining / fluidOutlet.parentElement.offsetWidth) * 50;
        updateTankFluidLevel(percentageBeforeDraining); // Update tank fluid level based on previous width percentage
        alert("%drained is "+percentageBeforeDraining);
        outletdrain.style.backgroundColor="orange";
        isOutDraining=false;
        alert("Outlet line Drained");
    }, { once: true });
   checkFluidFlow();
}

//Sump tank
function updateTankFluidLevel(percentage) {

     // Get the current height as a number (without the 'px' or '%')
     let currentHeight = parseFloat(window.getComputedStyle(tankFluid).height); 

     // Calculate the new height based on the given percentage
     let parentHeight = parseFloat(window.getComputedStyle(tankFluid.parentElement).height); // Assuming parent height is in pixels
     let newHeight = (currentHeight / parentHeight) * 100 + percentage; // Convert current height to percentage, add percentage
     
     // Clamp the new height between 0% and 100%
     newHeight = Math.min(100, Math.max(0, newHeight));
 
     // Set the updated height as a percentage
     tankFluid.style.height = `${newHeight}%`;

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

}


}

