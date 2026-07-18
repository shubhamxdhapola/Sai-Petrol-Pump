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

    worksheet.mergeCells("A1:H1");

    worksheet.getCell("A1").value = "Sales Report";

    worksheet.getCell("A1").font = {
        bold: true,
        size: 18
    };

    worksheet.getCell("A1").alignment = {
        horizontal: "center"
    };

    // ===== Date Range =====

    worksheet.mergeCells("A2:H2");

    worksheet.getCell("A2").value =
        `From ${startDate.toLocaleDateString()} To ${endDate.toLocaleDateString()}`;

    worksheet.getCell("A2").alignment = {
        horizontal: "center"
    };

    worksheet.columns = [
        {
            key: "date",
            width: 18
        },
        {
            key: "petrolSold",
            width: 18
        },
        {
            key: "dieselSold",
            width: 18
        },
        {
            key: "premiumSold",
            width: 18
        },
        {
            key: "petrolRevenue",
            width: 20
        },
        {
            key: "dieselRevenue",
            width: 20
        },
        {
            key: "premiumRevenue",
            width: 20
        },
        {
            key: "totalRevenue",
            width: 20
        }
    ];

    // ===== Header Style =====

    const headerRow = worksheet.getRow(3);

    headerRow.values = [
        "Date",
        "Petrol Sold (L)",
        "Diesel Sold (L)",
        "Premium Sold (L)",
        "Petrol Revenue",
        "Diesel Revenue",
        "Premium Revenue",
        "Total Revenue"
    ];

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

            premiumSold: row.premiumSold || 0,

            petrolRevenue: row.petrolRevenue,

            dieselRevenue: row.dieselRevenue,

            premiumRevenue: row.premiumRevenue || 0,

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

        premiumSold: totals.premiumSold,

        petrolRevenue: totals.petrolRevenue,

        dieselRevenue: totals.dieselRevenue,

        premiumRevenue: totals.premiumRevenue,

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

    worksheet.mergeCells("A1:F1");

    worksheet.getCell("A1").value = "Tank Refill Report";

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
            key: "date",
            width: 18
        },
        {
            key: "tank",
            width: 22
        },
        {
            key: "fuelType",
            width: 18
        },
        {
            key: "quantity",
            width: 18
        },
        {
            key: "pricePerLitre",
            width: 18
        },
        {
            key: "amount",
            width: 20
        }
    ];

    // ===== Header Style =====

    const headerRow = worksheet.getRow(3);

    headerRow.values = [
        "Date",
        "Tank",
        "Fuel Type",
        "Quantity (L)",
        "Price/L (₹)",
        "Amount (₹)"
    ];

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
            pricePerLitre: refill.pricePerLitre,
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

        pricePerLitre: "",

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