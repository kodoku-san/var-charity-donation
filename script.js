let dataTable;
const totalFiles = 11;

const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
});

function initializeDataTable() {
    dataTable = $('#dataTable').DataTable({
        responsive: true,
        columns: [
            { data: 'd' },
            { data: 'no' },
            { data: 'am' },
            { data: 'c' }
        ],
        columnDefs: [
            {
                targets: 2,
                render: function(data, type, row) {
                    if (type === 'display') {
                        const formatAm = formatter.format(data);
                        
                        if(data == $('#searchInput').val()) return `<span class="bg-yellow-300 text-slate-800">${formatAm}</span>`;

                        return formatAm;
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
        dom: '<"flex justify-between items-center max-lg:flex-wrap"l<"ml-2 max-lg:ml-0"i>>rtip',
        pagingType: "simple_numbers",
        rowCallback: function(row, data, index) {
            $(row).addClass('hover:bg-slate-100 transition-colors duration-200 text-slate-700');
        },
        drawCallback: function(settings) {
            var api = this.api();
            
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
    const regex = new RegExp(`(${removeVietnameseTones(query)})`, 'gi');
    
    for (let i = 1; i <= totalFiles; i++) {
        try {
            const response = await fetch(`content/data-${i}.json`);
            const data = await response.json();
            const filteredData = data.filter(item => 
                Object.values(item).some((value, index) => {
                    if(index == 2) value = parseFloat(value.replace(/,/g, ''));
                    return value.toString().toLowerCase().includes(removeVietnameseTones(query).toLowerCase())
                })
            ).map(item => {
                return {
                    ...item,
                    c: item.c.replace(regex, '<span class="bg-yellow-300 text-slate-800">$1</span>'),
                    no: item.no.replace(regex, '<span class="bg-yellow-300 text-slate-800">$1</span>'),
                    am: parseFloat(item.am.replace(/,/g, '')),
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
  
function removeVietnameseTones(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
    str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
    str = str.replace(/đ/g,"d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
    // Remove extra spaces
    // Bỏ các khoảng trắng liền nhau
    str = str.replace(/ + /g," ");
    str = str.trim();
    // Remove punctuations
    // Bỏ dấu câu, kí tự đặc biệt
    // str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
    return str;
}
