var data;
var currentPage = 1;
var rowsPerPage = 10;
var selRow;
var sortDirection = {
  ID: 1,
  Name: 1,
};
var maxLength = 63;
var desc;
var truncatedText;
var filteredData = [];

document.addEventListener("DOMContentLoaded", function () {
  function displayData() {
    var tableBody = document.querySelector("#dataTable tbody");
    tableBody.innerHTML = "";

    var displayData = filteredData.length > 0 ? filteredData : data;

    for (var i = 0; i < displayData.length; i++) {
      var item = displayData[i];
      var row = tableBody.insertRow();
      row.setAttribute("id", "row_" + item.ID);
      row.setAttribute("data-page", Math.floor(i / rowsPerPage) + 1);

      var selectCell = row.insertCell();
      var selectCheckbox = document.createElement("input");
      selectCheckbox.type = "checkbox";
      selectCheckbox.name = "selectedRow";
      selectCell.appendChild(selectCheckbox);
      var rowCheckboxes = document.querySelectorAll(
        'td input[type="checkbox"]'
      );
      rowCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener("change", function () {
          updateDeleteButtonVisibility();
        });
      });

      var idCell = row.insertCell();
      idCell.innerText = item.ID;

      var nameCell = row.insertCell();
      nameCell.innerText = item.Name + "\n" + item.Number;

      var descriptionCell = row.insertCell();
      var desc = item.Description;
      var truncatedText = desc.slice(0, maxLength);
      if (desc.length > maxLength) {
        truncatedText += "...";
      }
      descriptionCell.innerText = truncatedText;

      var statusCell = row.insertCell();
      statusCell.innerText = item.Status;
      statusCell.classList.add("status");

      if (item.Status === "Open") {
        statusCell.classList.add("open");
      }
      if (item.Status === "Paid") {
        statusCell.classList.add("paid");
      }
      if (item.Status === "Inactive") {
        statusCell.classList.add("inactive");
      }
      if (item.Status === "Due") {
        statusCell.classList.add("due");
      }

      var amount1Cell = row.insertCell();
      amount1Cell.innerText = "$" + item.Amount1 + " CAD";

      var amount2Cell = row.insertCell();
      amount2Cell.innerText = item.Amount2;
      addAmountClass(amount2Cell, "$" + item.Amount2 + " CAD");

      var amount3Cell = row.insertCell();
      amount3Cell.innerText = "$" + item.Amount3 + " CAD";

      var settingsCell = row.insertCell();
      settingsCell.innerHTML = `<span class="settings-icon">&#8942;</span>`;
      settingsCell.classList.add("settings-cell");

      settingsCell.addEventListener("mouseenter", function () {
        var settingsIcon = this.querySelector(".settings-icon");
        settingsIcon.style.visibility = "visible";
      });

      settingsCell.addEventListener("mouseleave", function () {
        var settingsIcon = this.querySelector(".settings-icon");
        settingsIcon.style.visibility = "hidden";
      });
      settingsCell.addEventListener("click", function (event) {
        handleSettings(event);
        console.log(selRow);
        var popup = createPopup();
        var iconRect = this.getBoundingClientRect();
        popup.style.top = iconRect.top + "px";
        popup.style.left = iconRect.left - 100 + "px";
        document.body.appendChild(popup);
      });
    }
    updatePagination();
  }

  function addAmountClass(cell, amount) {
    var amountValue = parseFloat(amount.replace(/[^\d.-]/g, ""));
    cell.innerText = amount;
    if (amountValue < 0) {
      cell.classList.add("negative");
    } else if (amountValue > 0) {
      cell.classList.add("positive");
    }
  }

  function generatePagination() {
    var pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    var displayData = filteredData.length > 0 ? filteredData : data;
    var numPages = Math.ceil(displayData.length / rowsPerPage);

    for (var i = 1; i <= numPages; i++) {
      var pageButton = document.createElement("span");
      pageButton.innerText = i;
      pageButton.classList.add("pagination-button");
      if (i === currentPage) {
        pageButton.classList.add("active");
      }
      pageButton.addEventListener("click", function () {
        currentPage = parseInt(this.innerText);
        updatePagination();
      });
      pagination.appendChild(pageButton);
    }
  }

  function updatePagination() {
    document.querySelectorAll("[data-page]").forEach(function (row) {
      row.style.display =
        row.getAttribute("data-page") == currentPage ? "table-row" : "none";
    });

    document.querySelectorAll(".pagination-button").forEach(function (button) {
      button.classList.remove("active");
    });

    var activeButton = document.querySelector(
      ".pagination-button:nth-child(" + currentPage + ")"
    );
    if (activeButton) {
      activeButton.classList.add("active");
    }
  }

  function updateRowsPerPage() {
    var selectElement = document.getElementById("rowsPerPage");
    rowsPerPage = parseInt(selectElement.value);
    currentPage = 1;
    displayData();
    generatePagination();
    updatePagination();
  }

  function sortDataBy(field) {
    sortDirection[field] = -sortDirection[field];
    data.sort(function (a, b) {
      if (a[field] < b[field]) return -sortDirection[field];
      if (a[field] > b[field]) return sortDirection[field];
      return 0;
    });
    currentPage = 1;
    displayData();
    generatePagination();
    updatePagination();
  }

  function createPopup() {
    var popup = document.createElement("div");
    popup.classList.add("popup");
    popup.innerHTML = `
          <div class="popup-option" data-action="view">View <img src="info.svg"></div>
          <div class="popup-option" data-action="edit">Edit <img src="edit.svg"></div>
          <div class="popup-option" data-action="delete">Delete <img src="bin.svg"></div>
      `;
    document.body.appendChild(popup);

    popup.querySelectorAll(".popup-option").forEach(function (option) {
      option.addEventListener("click", function (event) {
        var action = event.currentTarget.dataset.action;
        handlePopup(event, action);
        document.body.removeChild(popup);
      });
    });

    return popup;
  }

  function handleAddCustomer() {
    var form = document.createElement("form");
    form.classList.add("edit-form");

    var fields = [
      "Name",
      "Number",
      "Description",
      "Status",
      "Amount1",
      "Amount2",
      "Amount3",
    ];
    fields.forEach(function (field) {
      var label = document.createElement("label");
      label.textContent = field;
      var input = document.createElement("input");
      input.type = "text";
      input.name = field.toLowerCase();
      form.appendChild(label);
      form.appendChild(input);
    });

    var submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "Add";
    form.appendChild(submitButton);

    document.body.appendChild(form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var newItem = {
        ID: data.length + 1,
        Name: e.target.elements["name"].value,
        Number: e.target.elements["number"].value,
        Description: e.target.elements["description"].value,
        Status: e.target.elements["status"].value,
        Amount1: e.target.elements["amount1"].value,
        Amount2: e.target.elements["amount2"].value,
        Amount3: e.target.elements["amount3"].value,
      };
      data.push(newItem);
      document.body.removeChild(form);
      displayData();
      generatePagination();
      updatePagination();
    });
  }

  function handleDelete(selRow) {
    if (selRow) {
      var rowIndex = parseInt(selRow.id.split("_")[1]) - 1;
      data.splice(rowIndex, 1);
    } else {
      var checkedRows = document.querySelectorAll(
        'td input[type="checkbox"]:checked'
      );
      if (checkedRows.length === 0) {
        return;
      }
      var rowsToDelete = Array.from(checkedRows).map(function (checkbox) {
        return parseInt(checkbox.parentNode.parentNode.id.split("_")[1]) - 1;
      });
      rowsToDelete.sort(function (a, b) {
        return b - a;
      });
      rowsToDelete.forEach(function (rowIndex) {
        data.splice(rowIndex, 1);
      });
    }

    var maxPages = Math.ceil(data.length / rowsPerPage);
    if (currentPage > maxPages) {
      currentPage = maxPages;
    }

    displayData();
    generatePagination();
    updatePagination();

    if (data.length === 0) {
      currentPage = 1;
      var pagination = document.getElementById("pagination");
      pagination.innerHTML = "";
    }
    updateDeleteButtonVisibility();
  }

  function handlePopup(event, action) {
    if (!selRow) return;

    if (action === "edit") {
      var cells = selRow.querySelectorAll("td");

      var form = document.createElement("form");
      form.classList.add("edit-form");

      for (var i = 2; i < cells.length - 1; i++) {
        var label = document.createElement("label");
        label.textContent = cells[i].previousElementSibling
          ? cells[i].previousElementSibling.textContent
          : "";
        var input = document.createElement("input");
        input.type = "text";
        input.value = cells[i].innerText;
        form.appendChild(label);
        form.appendChild(input);
      }

      var submitButton = document.createElement("button");
      submitButton.type = "submit";
      submitButton.textContent = "Submit";
      form.appendChild(submitButton);

      document.body.appendChild(form);

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        for (var i = 2; i < cells.length - 1; i++) {
          cells[i].innerText = e.target.elements[i - 2].value;
        }

        document.body.removeChild(form);
      });
    } else if (action === "delete") {
      handleDelete(selRow);
    }
  }

  function handleSearch() {
    var searchInput = document.getElementById("searchInput");
    var searchTerm = searchInput.value.toLowerCase();

    if (searchTerm.length >= 3) {
      filteredData = data.filter(function (item) {
        return item.Name.toLowerCase().includes(searchTerm);
      });
    } else {
      filteredData = [];
    }

    currentPage = 1;
    displayData();
    generatePagination();
    updatePagination();

    if (filteredData.length === 0 && searchTerm.length >= 3) {
      var tableBody = document.querySelector("#dataTable tbody");
      tableBody.innerHTML = "No records Found";
    } else if (searchTerm.length === 0) {
      filteredData = [];
      displayData();
    }
  }

  var headerCheckbox = document.querySelector('th input[type="checkbox"]');
  headerCheckbox.addEventListener("change", function () {
    var rowCheckboxes = document.querySelectorAll('td input[type="checkbox"]');
    rowCheckboxes.forEach(function (checkbox) {
      checkbox.checked = headerCheckbox.checked;
    });
    updateDeleteButtonVisibility();
  });

  var rowCheckboxes = document.querySelectorAll('td input[type="checkbox"]');
  rowCheckboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      updateDeleteButtonVisibility();
    });
  });

  var deleteButton = document.getElementById("deleteButton");
  deleteButton.addEventListener("click", function () {
    handleDelete();
  });

  function updateDeleteButtonVisibility() {
    var deleteButton = document.getElementById("deleteButton");
    var searchInput = document.querySelector(".search");
    var numSelectedRows = document.getElementById("numSelectedRows");

    var rowCheckboxes = document.querySelectorAll(
      '#dataTable td input[type="checkbox"]'
    );

    var anyRowChecked = Array.from(rowCheckboxes).some(function (checkbox) {
      return checkbox.checked;
    });

    if (anyRowChecked) {
      deleteButton.style.display = "inline-block";
      searchInput.style.display = "none";

      var selectedRowCount = document.querySelectorAll(
        '#dataTable td input[type="checkbox"]:checked'
      ).length;
      numSelectedRows.textContent = selectedRowCount + " selected";
      numSelectedRows.style.display = "inline-block";
    } else {
      deleteButton.style.display = "none";
      searchInput.style.display = "inline-block";
      numSelectedRows.style.display = "none";
    }
  }

  fetch("data.json")
    .then((response) => response.json())
    .then((json) => {
      data = json;
      displayData();
      generatePagination();
      updatePagination();
    })
    .catch((error) => console.error("Error fetching JSON:", error));

  document
    .getElementById("rowsPerPage")
    .addEventListener("change", updateRowsPerPage);
  document
    .getElementById("addCustomerButton")
    .addEventListener("click", handleAddCustomer);

  document
    .getElementById("searchInput")
    .addEventListener("input", handleSearch);

  document
    .querySelector("th:nth-child(2)")
    .addEventListener("click", function () {
      sortDataBy("ID");
    });

  document
    .querySelector("th:nth-child(3)")
    .addEventListener("click", function () {
      sortDataBy("Name");
    });
});
function handleSettings(event) {
  selRow = event.target.closest("tr");
  console.log(selRow);
}
