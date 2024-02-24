let toggle = false;
let gradeElementBackups = [];
let classesArray = [];

const observer = new MutationObserver((mutations, observer) => {
  if (mutations.length > 100) {
    let currectClasses = document.querySelectorAll(
      "#portal-standard-container_Current > div"
    );

    let completedClasses = document.querySelectorAll(
      "#portal-standard-container_Complete > div"
    );
    // convert and combine the array from node lists
    classesArray = Array.from(currectClasses).concat(
      Array.from(completedClasses)
    );
    addEditButton();
    main();

    observer.disconnect();
  }
}).observe(document.getElementsByClassName("box-round")[0], {
  childList: true,
  subtree: true,
});

function editMode(t) {
  let editButton = document.getElementById("editMode");

  if (!t) {
    editButton.innerText = "Normal Mode";

    classesArray.forEach((classElement) => {
      if (!classElement) return;

      gradesElements = classElement.querySelector("span > table > tbody > tr");

      if (gradesElements == null) return;

      // remove first array element
      gradesElements = Array.from(gradesElements.children);

      gradesElements = gradesElements.filter(
        (gradeElement) =>
          !gradeElement.innerText.includes("--") &&
          !gradeElement.innerText.includes("OPS") &&
          !gradeElement.innerText.includes("No standard grade") &&
          !gradeElement.innerText.trim().length == 0
      );

      if (gradesElements.length == 0) return;

      gradesElements.forEach((element) => {
        // remove all (x) from the text
        element.textContent = element.textContent.replace(/\s\(.*\)/g, "");
        element.textContent = element.textContent.replace(
          "No standard grade entered.",
          ""
        );

        // remove (x) from the text
        element.innerText = element.innerText.replace(/\s\(.*\)/g, "");

        gradeElementBackups.push({
          element: element,
          id: element.id,
        });

        element.contentEditable = true;

        // remove all event listeners
        element.replaceWith(element.cloneNode(true));
      });
    });
    toggle = !toggle;

    console.log(gradeElementBackups);
  } else {
    editButton.innerText = "Edit Mode";

    gradeElementBackups.forEach((element) => {
      // find the element in the array with the same id
      let elementToEdit = document.getElementById(element.id);

      element.element.contentEditable = false;

      // set the innerText to the textContent of the cloned element
      element.element.innerText = elementToEdit.textContent;

      // replace the cloned element with the original element
      elementToEdit.replaceWith(element.element);

      // remove the backup element
      gradeElementBackups = gradeElementBackups.filter(
        (element) => element.id !== element.id
      );
    });

    main();

    toggle = !toggle;
  }
}

// make all elements that have grades editable by cloning the elemnt, then setting "element.contentEditable = true;", and when edit button is toggle off, make them read only, and recalculate the average using main().
function addEditButton() {
  // check to see if the edit button already exists
  if (!document.querySelector("#editMode")) {
    let buttonsDiv = document.querySelector(
      "#sample-ctrl > div.box-round > form > div.button-row.screenonly.ng-scope"
    );

    let button = document.createElement("button");

    button.type = "button";
    button.className = "ng-binding";

    button.id = "editMode";

    // Set the button text
    button.innerText = "Edit Mode";

    button.onclick = function () {
      editMode(toggle);
    };

    buttonsDiv.appendChild(button);
  }
}

function main() {
  let grades = [];

  classesArray.forEach((classElement) => {
    if (!classElement) return;

    let gradesElements = classElement.querySelector(
      "span > table > tbody > tr"
    );

    if (gradesElements == null) return;

    let name = classElement.querySelector("span > h3").innerText;

    // remove first array element
    gradesElements = Array.from(gradesElements.children);

    gradesElements = gradesElements.filter(
      (gradeElement) =>
        !gradeElement.innerText.includes("--") &&
        !gradeElement.innerText.includes("OPS") &&
        !gradeElement.innerText.trim().length == 0
    );

    if (gradesElements.length == 0) return;

    gradesElements.forEach((gradeElement) => {
      console.log(gradeElement);

      // replace anything that isnt a number or a period with nothing
      gradeElement.innerText = gradeElement.innerText.replace(/[^\d.-]/g, "");

      const periodCount = gradeElement.innerText.split(".").length - 1;

      // Check if there are more than one periods
      if (periodCount > 1) {
        // Find the last period's index
        const lastPeriodIndex = gradeElement.innerText.lastIndexOf(".");

        gradeElement.innerText =
          gradeElement.innerText.substring(0, lastPeriodIndex) +
          gradeElement.innerText.substring(lastPeriodIndex + 1);
      }

      if (isNaN(Number(gradeElement.innerText))) {
        return;
      }

      let grade = gradeElement.innerText;

      // grade = grade.replace(/[^\d.-]/g, "").slice(0, -1);

      let sbgGrade;

      console.log(grade, Number(grade));

      if (name.includes("AP")) {
        sbgGrade = apGPA(Number(grade));
      } else if (name.includes("(H)")) {
        sbgGrade = honorsGPA(Number(grade));
      } else {
        sbgGrade = cpGPA(Number(grade));
      }

      // round to hundreths
      sbgGrade = Math.round(sbgGrade * 100) / 100;

      gradeElement.innerText = `${grade} (${sbgGrade})`;

      if (gradeElement.id.includes("F1")) grades.push(sbgGrade);
    });
  });

  let sum = grades.reduce((a, b) => a + b, 0);

  let avg = sum / grades.length;

  avg = Math.round(avg * 100) / 100;

  // check if avgElement already exists
  if (document.querySelector("#avgElement")) {
    document.querySelector("#avgElement").remove();
  }
  let avgElement = document.createElement("h3");

  avgElement.innerText = `Average GPA: ${avg}`;

  avgElement.id = "avgElement";

  console.log(avg);

  document
    .querySelector("#portal-standard-container_Current")
    .insertBefore(
      avgElement,
      document.querySelector("#portal-standard-container_Current").children[1]
    );
}

/** Based on the following piecewise function : 
f(x) =
\begin{cases}
0 & \text{ } x < 2, \\
2x - 2.3 & \text{ } 2 \leq x \leq 2.15, \\
2.495x - 3.361 & \text{ } 2.15 < x \leq 2.55, \\
2.233x - 2.698 & \text{ } 2.55 < x \leq 3, \\
4 & \text{ } 3 < x \leq 3.5, \\
0.8x + 1.2 & \text{ } 3.5 < x \leq 4.
\end{cases} 

@param {number} x - The SBG grade
*/
function cpGPA(x) {
  if (x < 2) {
    return 0;
  } else if (x >= 2 && x <= 2.15) {
    return 2 * x - 2.3;
  } else if (x > 2.15 && x <= 2.55) {
    return 2.495 * x - 3.361;
  } else if (x > 2.55 && x <= 3) {
    return 2.233 * x - 2.698;
  } else if (x > 3 && x <= 3.5) {
    return 4;
  } else if (x > 3.5 && x <= 4) {
    return 0.8 * x + 1.2;
  } else {
    return 4.4;
  }
}

/** Based on the following piecewise funcetion : 

f(x) =
\begin{cases}
0 & x < 2, \\
1.68x - 1.611 & 2 \leq x \leq 2.15, \\
3.3257x - 5.149 & 2.15 < x \leq 2.45, \\
2.5479x - 3.243 & 2.45 < x < 3, \\
4.4 & 3 \leq x \leq 3.5, \\
0.6885x + 1.995 & 3.50 < x \leq 4.
\end{cases}
@param {number} x - The SBG grade
 */
function honorsGPA(x) {
  if (x < 2) {
    return 0;
  } else if (x >= 2 && x <= 2.15) {
    return 1.68 * x - 1.611;
  } else if (x > 2.15 && x <= 2.45) {
    return 3.3257 * x - 5.149;
  } else if (x > 2.45 && x < 3) {
    return 2.5479 * x - 3.243;
  } else if (x >= 3 && x <= 3.5) {
    return 4.4;
  } else if (x > 3.5 && x <= 4) {
    return 0.6885 * x + 1.995;
  } else {
    return 4.8;
  }
}

/* Based on the following piecewise function :
f(x) =
\begin{cases}
0 & x < 2 \\
1.32x - 0.839 & 2 \leq x \leq 2.15 \\
5x - 8.75 & 2.15 < x \leq 2.35 \\
2.7622x - 3.489 & 2.35 < x < 3 \\
4.8 & 3 \leq x \leq 3.5 \\
0.4x + 3.4 & 3.5 < x \leq 4
\end{cases}
 */
function apGPA(x) {
  if (x < 2) {
    return 0;
  } else if (x >= 2 && x <= 2.15) {
    return 1.32 * x - 0.839;
  } else if (x > 2.15 && x <= 2.35) {
    return 5 * x - 8.75;
  } else if (x > 2.35 && x < 3) {
    return 2.7622 * x - 3.489;
  } else if (x >= 3 && x <= 3.5) {
    return 4.8;
  } else if (x > 3.5 && x <= 4) {
    return 0.4 * x + 3.4;
  } else {
    return 5;
  }
}
