define(['EventBus', 'vue', 'ELEMENT'], function (EventBus, Vue, element) {
    var vm;
    Vue.use(element);

    function init() {
        vm = new Vue({
            el: '#customForm',
            data: {
                currentEditObj: {
                    name: "",
                    address: ""
                },
                newObj: {
                    id: "",
                    date: "",
                    name: "",
                    address: ""
                  },
                activeName:"erdp",
                newDialogVisible: false,
                tableData: [
                    {
                        date: "2016-05-02",
                        name: "王小虎",
                        address: "上海市普陀区金沙江路 1518 弄",
                        id: 2003331
                    },
                    {
                        date: "2016-05-04",
                        name: "王小虎",
                        address: "上海市普陀区金沙江路 1517 弄",
                        id: 2003332
                    }
                ],
                dialogVisible: false,
                form: {
                    name: "",
                    region: "",
                    date1: "",
                    date2: "",
                    delivery: false,
                    type: [],
                    resource: "",
                    desc: "",
                    Node03:""
                }, pdmForm: {
                    name: "",
                    region: "",
                    date1: "",
                    date2: "",
                    delivery: false,
                    type: [],
                    resource: "",
                    desc: "",
                    Node03:""
                  },
            },
            created: function () {

            },
            methods: {
                handleEdit:function(row) {
                    this.dialogVisible = true;
                    this.currentEditObj = JSON.parse(JSON.stringify(row));
                    
                  },
                  sureHandler: function() {
                    var that = this;
                    this.tableData.forEach(function(item) {
                      if (item.id == that.currentEditObj.id) {
                        item.address = that.currentEditObj.address;
                      }
                    });
                    this.dialogVisible = false;
                  },
                  addTableObj:function() {
                    this.newDialogVisible = true;
                    this.newObj.name = "";
                    this.newObj.address = "";
                  },
                  newHandler:function() {
                    var now = new Date();
                    var m = now.getMonth() + 1;
                    var d = now.getDay();
                    var date =
                      now.getFullYear() +
                      "-" +
                      (m > 9 ? m : "0" + m) +
                      "-" +
                      (d > 9 ? d : "0" + d);
                    this.newObj.id = now.getTime();
                    this.newObj.date = date;
                    var newObj = JSON.parse(JSON.stringify(this.newObj));
                    this.tableData.push(newObj);
                    this.newDialogVisible = false;
                  },
                  deleteRow:function(index, tableData) {
                    var _this = this;
                    this.$confirm("确认刪除？")
                      .then(function() {
                        _this.tableData.splice(index, 1);
                      })
                      .catch(function() {});
                    
                  },
                  onSubmit:function() {
                    
                    
                    
                  }
            },
        });


        EventBus.once("process:customForm:setValue", function (evt, data, fn) {
            
            if(data.tableData){
              vm.tableData = data.tableData;
            }
            if(data.form){
              vm.form = data.form;
            }
            if(data.pdmForm){
              vm.pdmForm = data.pdmForm;
            }
        });
        EventBus.once("process:customForm:getValue", function (evt, fn) {
            var formData = {
                tableData:vm.tableData,
                form:vm.form,
                pdmForm:vm.pdmForm
            };
            fn(formData);
            
        });

    }
    return {
        init: init
    };

});
