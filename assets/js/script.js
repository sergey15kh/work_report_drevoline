let rowNumber = 1;

function updateRowNumbers() {
    const rows = document.querySelectorAll('#dataBody tr');
    rows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });
}

function checkLocalStorage() {
    const savedData = localStorage.getItem('tableData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        for (const rowData of parsedData) {
            addRowWithData(rowData);
        }
        recalculateTotalAmount();
        updateRowNumbers();
    }
}

function addRowWithData(data) {
    const tbody = document.getElementById('dataBody');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td>${rowNumber}</td>
        <td><input type="number" name="orderNumber" value="${data[0]}"></td>
        <td><input type="date" name="Startdate" name="shipmentDate" value="${data[1]}"></td>
        <td><input type="number" name="waybill" value="${data[2]}"></td>
        <td><input type="text" name="dealName" value="${data[3]}"></td>
        <td><input type="number" name="orderAmount" value="${data[4]}"></td>
        <td><input type="text" name="customerName" value="${data[5]}"></td>
        <td><input type="tel" id="phone" name="phone" placeholder="380 50 149 81 76" pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}" required name="customerPhone" value="${data[6]}"></td>
        <td><input type="text" name="dealStage" value="${data[7]}"></td>
        <td><input type="checkbox" name="closedDeal" ${data[8] ? 'checked' : ''}></td>
        <td><button onclick="deleteRow(this)">Удалить</button></td>
    `;

    tbody.appendChild(newRow);
    rowNumber++;
}

function addRow() {
    const tbody = document.getElementById('dataBody');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td>${rowNumber}</td>
        <td><input type="number" name="orderNumber"></td>
        <td><input type="date" name="Startdate" name="shipmentDate"></td>
        <td><input type="number" name="waybill"></td>
        <td><input type="text" name="dealName"></td>
        <td><input type="number" name="orderAmount"></td>
        <td><input type="text" name="customerName"></td>
        <td><input type="tel" id="phone" name="phone" placeholder="380 50 149 81 76" pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}" required name="customerPhone"></td>
        <td><input type="text" name="dealStage"></td>
        <td><input type="checkbox" name="closedDeal"></td>
        <td><button onclick="deleteRow(this)">Удалить</button></td>
    `;

    tbody.appendChild(newRow);
    rowNumber++;
    updateRowNumbers();
}

function deleteRow(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    recalculateTotalAmount();
    updateRowNumbers();
}

function recalculateTotalAmount() {
    const rows = document.querySelectorAll('#dataBody tr');
    let totalAmount = 0;

    rows.forEach(row => {
        const amountInput = row.querySelector('input[name="orderAmount"]');
        if (amountInput) {
            const amount = parseFloat(amountInput.value) || 0;
            totalAmount += amount;
        }
    });

    document.getElementById('totalAmount').textContent = totalAmount.toFixed(2);
    updateSalary(totalAmount);
}

function updateSalary(totalAmount) {
    const salary = totalAmount * 0.02;
    document.getElementById('salary').textContent = salary.toFixed(2);
}

function saveData() {
    recalculateTotalAmount();
    const dealCount = document.querySelectorAll('#dataBody tr').length;
    document.getElementById('dealCount').textContent = dealCount;

    const rows = document.querySelectorAll('#dataBody tr');
    const data = [];

    rows.forEach(row => {
        const rowData = [];
        row.querySelectorAll('input').forEach(input => {
            if (input.type === 'checkbox') {
                rowData.push(input.checked);
            } else {
                rowData.push(input.value);
            }
        });
        data.push(rowData);
    });

    localStorage.setItem('tableData', JSON.stringify(data));
    console.log(data);
}

function confirmGenerateReport() {
    const confirmation = confirm("Вы уверены?");
    if (confirmation) {
        generateAndRemoveClosedDeals();
    }
}

function generateAndRemoveClosedDeals() {
    const rows = document.querySelectorAll('#dataBody tr');
    const dataToExport = [];
    const rowsToRemove = [];

    dataToExport.push([
        '№',
        'Номер заказа',
        'Дата Отгрузки',
        'Расходная накладная',
        'Название сделки',
        'Сумма заказа',
        'Имя клиента',
        'Телефон клиента',
        'Стадия сделки'
    ]);

    rows.forEach((row, index) => {
        const closedDealCheckbox = row.querySelector('input[name="closedDeal"]');
        if (closedDealCheckbox && closedDealCheckbox.checked) {
            const rowData = [];
            row.querySelectorAll('input').forEach((input, columnIndex) => {
                if (columnIndex !== 9) { // Exclude the "Сделка закрыта" column (index 9)
                    rowData.push(input.value);
                }
            });
            dataToExport.push(rowData);
            rowsToRemove.push(index);
        }
    });

    rowsToRemove.reverse().forEach(index => {
        rows[index].remove();
    });

    recalculateTotalAmount();
    updateRowNumbers();

    if (dataToExport.length > 0) {
        const ws = XLSX.utils.aoa_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Сделки');
        XLSX.writeFile(wb, 'Отчет.xlsx');
    }
}

function saveData() {
    const rows = document.querySelectorAll('#dataBody tr');
    const data = [];

    let allFieldsFilled = true;

    rows.forEach(row => {
        const rowData = [];
        row.querySelectorAll('input').forEach(input => {
            if (input.type === 'checkbox') {
                rowData.push(input.checked);
            } else {
                const value = input.value.trim(); // Удаляем пробелы по краям
                if (value === '') {
                    allFieldsFilled = false;
                    input.classList.add('error-field'); // Добавляем класс для выделения пустых полей
                }
                rowData.push(value);
            }
        });
        data.push(rowData);
    });

    if (!allFieldsFilled) {
        // Показываем блок с ошибкой
        document.getElementById('errorBlock').style.display = 'block';
        return;
    } else {
        // Если все поля заполнены, скрываем блок с ошибкой (если он виден)
        document.getElementById('errorBlock').style.display = 'none';
    }

    // Сохраняем данные в локальное хранилище
    localStorage.setItem('tableData', JSON.stringify(data));
    console.log(data);

    // Обновляем общую сумму заказов и количество сделок
    recalculateTotalAmount();
    const dealCount = document.querySelectorAll('#dataBody tr').length;
    document.getElementById('dealCount').textContent = dealCount;
}

// Добавляем обработчик события для удаления класса 'error-field' при изменении значений полей
document.getElementById('dataBody').addEventListener('input', function (event) {
    if (event.target.tagName === 'INPUT') {
        event.target.classList.remove('error-field');
        document.getElementById('errorBlock').style.display = 'none'; // Скрываем блок с ошибкой при изменении значения поля
    }
});


checkLocalStorage();