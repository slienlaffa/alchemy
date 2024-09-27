let idNumber = 0;
// Load the periodic table data
let periodicTableData;

function createPeriodicElement(element, x, y) {
    const elementDiv = document.createElement('div');
    elementDiv.className = 'periodic-element';
    elementDiv.style.left = `${x}px`;
    elementDiv.style.top = `${y}px`;
    //elementDiv.style.background = `#${element['cpk-hex']}`;
    elementDiv.id = `element${idNumber}`;
    elementDiv.innerHTML = `
        <div class="atomic-number">${element.number}</div>
        <div class="info tooltip">i<span class="tooltiptext">${element.summary}</span></div>
        <div class="element-symbol">${element.symbol}</div>
        <div class="element-name">${element.name}</div>
        <div class="atomic-weight">${element.atomic_mass}</div>
    `;
    idNumber++
    document.body.appendChild(elementDiv);
    requestAnimationFrame(() => {
        elementDiv.style.opacity = '1';
        elementDiv.style.transform = 'scale(1)';
    });
    dragElement(elementDiv);
    return elementDiv;
}

function getElement(number) {
    return periodicTableData[periodicTableData.order[number - 1]]
}

function placeElementHydrogen(x, y) {
    const element = getElement(1);
    createPeriodicElement(element, x, y)
}

onload = function () {
    fetch('periodic-table-lookup.json')
        .then(response => response.json())
        .then(data => {
            periodicTableData = data;
            bigBang()
        })
        .catch(error => console.error('Error loading periodic table data:', error));
}


function bigBang() {
    const maxX = innerWidth - 40;
    const maxY = innerHeight - 60;
    const sizeX = maxX / 5;
    const sizeY = maxY / 5;

    for (let y = 10; y < maxY; y += sizeY) {
        for (let x = 10; x < maxX; x += sizeX) {
            placeElementHydrogen(x, y);
        }
    }
}

/** Contiene toda la funcionalidad de movimiento */
function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.addEventListener("dblclick", (event) => {
        const newElement = getElement(elmnt.querySelector('.atomic-number').textContent)
        const rect = elmnt.getBoundingClientRect();
        const offset = (rect.width / 2) - 1;
        createPeriodicElement(newElement, elmnt.offsetLeft + offset, elmnt.offsetTop + offset);
    });
    elmnt.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.classList.add("hold")
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement(e) {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
        elmnt.classList.remove("hold")

        const rect = elmnt.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const nearbyElements = document.elementsFromPoint(centerX, centerY);

        for (const target of nearbyElements) {
            if (target !== elmnt && target.classList.contains('periodic-element')) {
                const targetRect = target.getBoundingClientRect();
                const distance = Math.hypot(
                    centerX - (targetRect.left + targetRect.width / 2),
                    centerY - (targetRect.top + targetRect.height / 2)
                );

                if (distance < rect.width) {  // Adjust this value to change fusion distance
                    // Fusion logic
                    const newAtomicNumber = parseInt(elmnt.querySelector('.atomic-number').textContent) +
                        parseInt(target.querySelector('.atomic-number').textContent);

                    const newElement = getElement(newAtomicNumber);

                    if (newElement) {
                        const newElementDiv = createPeriodicElement(newElement, target.offsetLeft, target.offsetTop);
                        if (newAtomicNumber == 119)
                            celebration(newElementDiv);
                        target.remove();
                        elmnt.remove();
                    } else {
                        bigCrunch(target, elmnt);
                    }
                    break;
                }
            }
        }
    }

    function celebration(elementDiv) {
        const celebrationGif = document.createElement('img');
        celebrationGif.src = 'celebration.gif';
        celebrationGif.className = 'firework';
        celebrationGif.style.left = `${elementDiv.offsetLeft}px`;
        celebrationGif.style.top = `${elementDiv.offsetTop}px`;

        document.body.appendChild(celebrationGif);

        setTimeout(() => {
            celebrationGif.remove();
        }, 2000);
    }

    function bigCrunch(target, elmnt) {
        const explosionDiv = document.createElement('div');
        explosionDiv.style.left = `${target.offsetLeft}px`;
        explosionDiv.style.top = `${target.offsetTop}px`;
        explosionDiv.className = 'explosion';
        document.body.appendChild(explosionDiv);

        target.remove()
        elmnt.remove()

        // Animate the shockwave
        setTimeout(() => {
            explosionDiv.style.transform = 'translate(-50%, -50%) scale(1)';
            explosionDiv.style.opacity = '1';
        }, 50);

        // Remove the explosion div and create the initial state again
        setTimeout(() => {
            explosionDiv.remove();
            document.body.innerHTML = "";
            bigBang()
        }, 1500);
    }
}