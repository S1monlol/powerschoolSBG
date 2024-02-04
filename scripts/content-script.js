const observer = new MutationObserver((mutations) => {
  if (mutations.length > 100) {
    main();
  }
}).observe(document.getElementsByClassName("box-round")[0], {
  childList: true,
  subtree: true,
});

function main() {
  let grades = [];

  let currectClasses = document.querySelectorAll(
    "#portal-standard-container_Current > div"
  );

  let completedClasses = document.querySelectorAll(
    "#portal-standard-container_Complete > div"
  );
  // convert and combine the array from node lists
  let classesArray = Array.from(currectClasses).concat(
    Array.from(completedClasses)
  );

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
        gradeElement.innerText.includes("View standard grade") &&
        !gradeElement.innerText.includes("--")
    );

    if (gradesElements.length == 0) return;

    gradesElements.forEach((gradeElement) => {
      let grade = gradeElement.querySelector("span").innerText;

      grade = grade.replace(/[^\d.-]/g, "").slice(0, -1);

      let sbgGrade;

      if (name.includes("AP")) {
        sbgGrade = apGPA(Number(grade));
      } else if (name.includes("(H)")) {
        sbgGrade = honorsGPA(Number(grade));
      } else {
        sbgGrade = cpGPA(Number(grade));
      }

      // round to hundreths
      sbgGrade = Math.round(sbgGrade * 100) / 100;

      gradeElement.querySelector("span").innerText = `${grade} (${sbgGrade})`;

      if (gradeElement.id.includes("F1")) grades.push(sbgGrade);
    });
  });

  let sum = grades.reduce((a, b) => a + b, 0);

  let avg = sum / grades.length;

  avg = Math.round(avg * 100) / 100;

  let avgElement = document.createElement("h3");

  avgElement.innerText = `Average GPA: ${avg}`;

  console.log(avg);

  document
				.querySelector("#portal-standard-container_Current")
				.insertBefore(
				  avgElement,
					document.querySelector("#portal-standard-container_Current")
						.children[1]
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
