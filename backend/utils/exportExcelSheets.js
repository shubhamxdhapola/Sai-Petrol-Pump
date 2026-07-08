import ExcelJS from "exceljs";

export const exportSalesExcel = async (
    res,
    report,
    totals,
    startDate,
    endDate
) => {

    const workbook = new ExcelJS.Workbook();

    workbook.creator = "PPMS";

    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Sales Report");

    // ===== Title =====

    worksheet.mergeCells("A1:F1");

    worksheet.getCell("A1").value = "Sales Report";

    worksheet.getCell("A1").font = {
        bold: true,
        size: 18
    };

    worksheet.getCell("A1").alignment = {
        horizontal: "center"
    };

    // ===== Date Range =====

    worksheet.mergeCells("A2:F2");

    worksheet.getCell("A2").value =
        `From ${startDate.toLocaleDateString()} To ${endDate.toLocaleDateString()}`;

    worksheet.getCell("A2").alignment = {
        horizontal: "center"
    };

    // ===== Header =====

    worksheet.columns = [

        {
            header: "Date",
            key: "date",
            width: 18
        },

        {
            header: "Petrol Sold (L)",
            key: "petrolSold",
            width: 18
        },

        {
            header: "Diesel Sold (L)",
            key: "dieselSold",
            width: 18
        },

        {
            header: "Petrol Revenue",
            key: "petrolRevenue",
            width: 20
        },

        {
            header: "Diesel Revenue",
            key: "dieselRevenue",
            width: 20
        },

        {
            header: "Total Revenue",
            key: "totalRevenue",
            width: 20
        }

    ];

    // ===== Header Style =====

    const headerRow = worksheet.getRow(3);

    headerRow.font = {
        bold: true
    };

    headerRow.fill = {

        type: "pattern",

        pattern: "solid",

        fgColor: {
            argb: "D9EAFD"
        }

    };

    // ===== Data =====

    report.forEach(row => {

        worksheet.addRow({

            date: row.date,

            petrolSold: row.petrolSold,

            dieselSold: row.dieselSold,

            petrolRevenue: row.petrolRevenue,

            dieselRevenue: row.dieselRevenue,

            totalRevenue: row.totalRevenue

        });

    });

    // ===== Empty Row =====

    worksheet.addRow({});

    // ===== Total Row =====

    worksheet.addRow({

        date: "TOTAL",

        petrolSold: totals.petrolSold,

        dieselSold: totals.dieselSold,

        petrolRevenue: totals.petrolRevenue,

        dieselRevenue: totals.dieselRevenue,

        totalRevenue: totals.totalRevenue

    });

    const totalRow = worksheet.lastRow;

    totalRow.font = {
        bold: true
    };

    totalRow.fill = {

        type: "pattern",

        pattern: "solid",

        fgColor: {
            argb: "FFF2CC"
        }

    };

    // ===== Borders =====

    worksheet.eachRow(row => {

        row.eachCell(cell => {

            cell.border = {

                top: {
                    style: "thin"
                },

                left: {
                    style: "thin"
                },

                bottom: {
                    style: "thin"
                },

                right: {
                    style: "thin"
                }

            };

        });

    });

    // ===== Download =====

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=Sales_Report.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

};

export const exportRefillExcel = async (
    res,
    report,
    totals,
    startDate,
    endDate
) => {

    const workbook = new ExcelJS.Workbook();

    workbook.creator = "PPMS";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Tank Refill Report");

    // ===== Title =====

    worksheet.mergeCells("A1:E1");

    worksheet.getCell("A1").value = "Tank Refill Report";

    worksheet.getCell("A1").font = {
        bold: true,
        size: 18
    };

    worksheet.getCell("A1").alignment = {
        horizontal: "center"
    };

    // ===== Date Range =====

    worksheet.mergeCells("A2:E2");

    worksheet.getCell("A2").value =
        `From ${startDate.toLocaleDateString()} To ${endDate.toLocaleDateString()}`;

    worksheet.getCell("A2").alignment = {
        horizontal: "center"
    };

    // ===== Header =====

    worksheet.columns = [
        {
            header: "Date",
            key: "date",
            width: 18
        },
        {
            header: "Tank",
            key: "tank",
            width: 22
        },
        {
            header: "Fuel Type",
            key: "fuelType",
            width: 18
        },
        {
            header: "Quantity (L)",
            key: "quantity",
            width: 18
        },
        {
            header: "Amount (₹)",
            key: "amount",
            width: 20
        }
    ];

    // ===== Header Style =====

    const headerRow = worksheet.getRow(3);

    headerRow.font = {
        bold: true
    };

    headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
            argb: "D9EAFD"
        }
    };

    // ===== Data =====

    report.forEach(refill => {

        worksheet.addRow({
            date: new Date(refill.date).toLocaleDateString(),
            tank: refill.tank,
            fuelType: refill.fuelType,
            quantity: refill.quantity,
            amount: refill.amount
        });

    });

    // ===== Empty Row =====

    worksheet.addRow({});

    // ===== Totals =====

    worksheet.addRow({

        date: "TOTAL",

        tank: "",

        fuelType: "",

        quantity: totals.quantity,

        amount: totals.amount

    });

    const totalRow = worksheet.lastRow;

    totalRow.font = {
        bold: true
    };

    totalRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
            argb: "FFF2CC"
        }
    };

    // ===== Borders =====

    worksheet.eachRow(row => {

        row.eachCell(cell => {

            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };

        });

    });

    // ===== Center Alignment =====

    worksheet.eachRow(row => {

        row.eachCell(cell => {

            cell.alignment = {
                vertical: "middle",
                horizontal: "center"
            };

        });

    });

    // ===== Download =====

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
        "Content-Disposition",
        'attachment; filename="Tank_Refill_Report.xlsx"'
    );

    await workbook.xlsx.write(res);

    res.end();
};