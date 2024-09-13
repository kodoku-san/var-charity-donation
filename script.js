let dataTable;
const totalFiles = 11;

const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
});

function initializeDataTable() {
    dataTable = $('#dataTable').DataTable({
        columns: [
            { data: 'd' },
            { data: 'no' },
            { data: 'am' },
            { data: 'c' }
        ],
        columnDefs: [
            {
                targets: 2, // Cột số tiền (index 2)
                render: function(data, type, row) {
                    if (type === 'display') {
                        return formatter.format(data)
                    }
                    return data;
                }
            },
            { className: "border-b border-slate-200 text-sm", targets: "_all" }
        ],
        
        pageLength: 20,
        lengthMenu: [[10, 20, 50, 100, 200], [10, 20, 50, 100, 200]],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.11.5/i18n/vi.json'
        },
        processing: true,
        deferRender: true,
        scrollY: 400,
        dom: '<"flex justify-between items-center"l<"ml-2"i>>rtip',
        pagingType: "simple_numbers",
        rowCallback: function(row, data, index) {
            $(row).addClass('hover:bg-slate-100 transition-colors duration-200 text-slate-700');
        },
        drawCallback: function(settings) {
            var api = this.api();
            var pageInfo = api.page.info();
            
            $('.dataTables_paginate')
                .addClass('mt-4 flex justify-center')
                .find('.paginate_button')
                .addClass('px-3 py-1 bg-white border border-slate-300 text-slate-500 hover:bg-slate-100')
                .filter('.current')
                .addClass('bg-blue-500 text-white hover:bg-blue-600')
                .removeClass('bg-white text-slate-500');
            
            $('.dataTables_info').addClass('text-sm text-slate-700');
            
            $('.dataTables_length select').addClass('ml-1 mr-1 py-1 px-2 border border-slate-300 rounded-md');
        }
    });
}

async function searchData(query) {
    $('#loading').show();
    dataTable.clear();

    for (let i = 1; i <= totalFiles; i++) {
        try {
            const response = await fetch(`content/data-${i}.json`);
            const data = await response.json();
            const filteredData = data.filter(item => 
                Object.values(item).some(value => 
                    value.toString().toLowerCase().includes(query.toLowerCase())
                )
            ).map(item => {
                return {
                    ...item,
                    am: parseFloat(item.am.replace(/,/g, ''))
                };
            });
            dataTable.rows.add(filteredData).draw(false);
        } catch (error) {
            console.error(`Error loading or processing data-${i}.json:`, error);
        }
    }

    $('#loading').hide();
}

$(document).ready(function() {
    initializeDataTable();

    $('#searchButton').on('click', function() {
        const query = $('#searchInput').val();
        if (query) {
            searchData(query);
        }
    });

    $('#searchInput').on('keypress', function(e) {
        if (e.which === 13) {
            $('#searchButton').click();
        }
    });
});
  