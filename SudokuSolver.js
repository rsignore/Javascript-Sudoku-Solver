// JavaScript source code
//
function clearAllBoxes() {
    var textBoxes = document.getElementsByTagName("input");

    for (var textBox in textBoxes) {
        if (textBoxes[textBox].type === "text") {

            // reset the box to normal
            //
            textBoxes[textBox].value = "";
            textBoxes[textBox].style.fontStyle = "normal";
            textBoxes[textBox].style.color = "black";
        }
    }
}

function solveSudokuPuzzle() {

    var solver = new sudokuSolver();

    if (solver.solve()) {
        // alert("Puzzle solved!");
    }
    else {
        // alert("I could not solve the puzzle.")
    }
}

class sudokuSolver {

    // the constructor creates the data structures necessary to
    // solve the Puzzle
    //
    constructor() {

        // arrays to hold the rows, columns, and squares values
        //
        this.rows = [];
        this.columns = [];
        this.squares = [];

        this.solved = false;
        this.canSolve = true;

        var textBoxes = document.getElementsByTagName("input");

        for (var textBox in textBoxes) {
            if (textBoxes[textBox].type === "text") {

                //add the new cell to it's proper row, column, and square
                //
                var cellNum = Number(textBoxes[textBox].id.slice(4));

                var newCell = new sudokuCell(Number(textBoxes[textBox].value), textBoxes[textBox].id);

                // the row is the 10's digit and the column is the 1's digit.
                //
                var rowNum = parseInt(cellNum / 10);
                var colNum = cellNum - (rowNum * 10);

                // Since we're working with arrays, make the number 0 based.
                //
                rowNum--;
                colNum--;

                // add a reference of the box to the right row array
                //
                if (this.rows[rowNum] === undefined) {
                    this.rows[rowNum] = new Array(9);
                }

                var row = this.rows[rowNum];
                row[colNum] = newCell;

                // now add the reference to the box to the columns array
                //
                if (this.columns[colNum] === undefined) {
                    this.columns[colNum] = new Array(9);
                }

                var column = this.columns[colNum];
                column[rowNum] = newCell;

                // add a reference to the box to the square array
                //
                var bigSquareNum = (parseInt(rowNum / 3) * 3) + parseInt(colNum / 3);
                var boxInSquareNum = (parseInt(rowNum % 3) * 3) + parseInt(colNum % 3);

                if (this.squares[bigSquareNum] === undefined) {
                    this.squares[bigSquareNum] = new Array(9);
                }

                var square = this.squares[bigSquareNum];
                square[boxInSquareNum] = newCell;

                // set the cell's row, column, and square
                //
                newCell.setRowColSquare(row, column, square)
            }
        }

    }

    setupArray(arrayToSetup) {

      for(var currentCellNo in arrayToSetup) {
        var currentCell = arrayToSetup[currentCellNo];

        // does this cell need solving, then et up its scratch pad
        //
        if (currentCell.cellValue === 0) {

          if (currentCell.scratchPad.length > 1) {
            for (var otherCellNo in arrayToSetup) {
              if (currentCellNo !== otherCellNo) {

                var otherCell = arrayToSetup[otherCellNo];

                // remove any value that is alredy selected that is already
                // solved in the puzzle
                //
                if(otherCell.cellValue !== 0) {
                  var killScratch = currentCell.scratchPad.indexOf(otherCell.cellValue);

                  if (killScratch > -1) {
                    currentCell.scratchPad.splice(killScratch, 1);
                  }
                }
              }
            }
          }
        }
      }
    }

    setupDimension(arrayDimension) {

      for (var singleArray in arrayDimension) {
        this.setupArray(arrayDimension[singleArray]);
      }
    }

    setupPuzzle() {

      this.setupDimension(this.rows);
      this.setupDimension(this.columns);
      this.setupDimension(this.squares);

    }

    // solve attempts to solve the puzzle
    // returns true if was able to solve the puzzle, false otherwise
    //
    solve() {

      this.setupPuzzle();

      while(this.solveDimension(this.rows) || this.solveDimension(this.columns) ||
            this.solveDimension(this.squares)) {
        // nothing to do in here
      }
      return false;
    }

    // solveDimension solves a group of 9 rows, columns, or aquares, and attempts
    // to so solve each one
    //
    solveDimension(arrayDimension) {

      var madeAChange = false;

      for(var singleArray in arrayDimension) {

          madeAChange |= this.solveSingleArray(arrayDimension[singleArray]);
      }

      return madeAChange;
    }

    // solveSingleArray solves a group of nine cells. This is where most of the
    // work gets done in the solver.
    //
    solveSingleArray(arrayToSolve) {

      var madeAChange = false;

      for(var currentCellNo in arrayToSolve) {
        var currentCell = arrayToSolve[currentCellNo];

        // does this cell need solving
        //
        if (currentCell.cellValue === 0) {

          if (currentCell.scratchPad.length > 1) {
            for (var otherCellNo in arrayToSolve) {
              if (currentCellNo !== otherCellNo) {

                var otherCell = arrayToSolve[otherCellNo];

                if(otherCell.cellValue !== 0) {
                  var killScratch = currentCell.scratchPad.indexOf(otherCell.cellValue);

                  if (killScratch > -1) {
                    currentCell.scratchPad.splice(killScratch, 1);
                    madeAChange = true;
                  }
                }
              }
            }
          }

          // did the cell get solved?
          //
          if (currentCell.scratchPad.length === 1) {
            currentCell.solveCell(currentCell.scratchPad[0]);
            madeAChange = true;
          }
        }
      }

      // see if we can solve by singles elimination
      //
     madeAChange |= this.solveArrayByScratchPad(arrayToSolve);

      return madeAChange;
    }

  // solveArrayByScratchPad looks at the scratch pad entries in each cell to see if
  // the values can be determined by the possible scratch Pad values
  //
  solveArrayByScratchPad(arrayToSolve) {
    var madeAChange = false;

    for(var currentCellNo in arrayToSolve) {
      var currentCell = arrayToSolve[currentCellNo];

      // does this cell need solving
      //
      if (currentCell.cellValue === 0) {
        for(var currentScratchNo in currentCell.scratchPad) {
          var currentScratchValue = currentCell.scratchPad[currentScratchNo];
          var scratchValueFound = false;

          // now loop thru each other cell's scratchPad to see if the currentScratchValue
          // is not a scratch value for another cell in the arrayToSolve
          //
          for (var otherCellNo in arrayToSolve) {
            if (currentCellNo !== otherCellNo) {

              var otherCell = arrayToSolve[otherCellNo];
              if (otherCell.cellValue === 0) {
                for (var otherScratchNo in otherCell.scratchPad) {
                  var otherScratchValue = otherCell.scratchPad[otherScratchNo];

                  if (otherScratchValue === currentScratchValue) {
                    scratchValueFound = true;
                    break; // out of the otherScratchNo loop
                  }
                }
              }
              else if (otherCell.cellValue === currentScratchValue) {
                scratchValueFound = true;
                break;
              }
            }
          }
          // now see if this scratch value was found in other cells, if not then
          // the scratch value is the value for this cell
          //
          if(scratchValueFound === false) {
            currentCell.solveCell(currentScratchValue);
            madeAChange = true;
            break; // out of the currentScratchNo loop
          }
        }
      }
    }
    return madeAChange;
  }
}

// The class sudokuBox represents a single cell in a sudoku puzzle. The cell
// can have a known value or it can contain a list of possible values
//
class sudokuCell {

    constructor(startValue, cellId) {

        this.cellRow = this.cellColumn = this.cellSquare = null;

        // we'll use 0 to represent a box that did not have a start value
        //
        this.cellValue = 0;

        //save the ID of the text box so we can write back to it
        //
        this.cellId = cellId;

        if (startValue !== null && startValue !== undefined && typeof startValue === "number") {
            this.cellValue = startValue;
        }

        // if the value is known, just put the value in the scratch pad
        //
        if(this.cellValue !== 0) {
            this.scratchPad = [];
        }
        else {
          this.scratchPad = [1,2,3,4,5,6,7,8,9];
        }
    }

    displaySolvedValue () {

      var inputBox = document.getElementById(this.cellId);

      if(this.cellValue !== 0) {
        inputBox.value = this.cellValue.toString();
        inputBox.style.fontStyle = "italic";
        inputBox.style.color = "blue";
      }
    }

    setRowColSquare(aRow, aCol, aSquare) {
      this.cellRow = aRow;
      this.cellColumn = aCol;
      this.cellSquare = aSquare;
    }

    // solveCell sets this cell to a value, displays the value on the UI and
    //
    solveCell(toValue) {
      this.cellValue = toValue;
      this.scratchPad = [];
      this.displaySolvedValue();

      // remove the new value from the scratch items in all arrays this cell is in
      //
      this.removeScratchValue(this.cellValue, this.cellRow);
      this.removeScratchValue(this.cellValue, this.cellColumn);
      this.removeScratchValue(this.cellValue, this.cellSquare);
    }

    // removeScratchValue deletes the value from all possible scratch entries in the array
    //
    removeScratchValue(valueToRemove, fromArray)
    {
      for (var currentCellNo in fromArray) {
        var currentCell = fromArray[currentCellNo];

        for(var currentScratchNo in currentCell.scratchPad) {
          var currentScratchValue = currentCell.scratchPad[currentScratchNo];

          if (currentScratchValue === valueToRemove) {
            currentCell.scratchPad.splice(currentScratchNo, 1);
            break;
          }
        }
      }
    }
}
