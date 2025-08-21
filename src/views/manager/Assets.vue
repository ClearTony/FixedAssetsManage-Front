<template>
  <div>
    <div class="search">
      <el-input placeholder="请输入资产名称查询" style="width: 200px" v-model="name"></el-input>
      <el-select placeholder="请选择资产分类" style="width: 200px; margin-left: 10px" v-model="category">
        <el-option v-for="item in categoryList" :key="item.id" :value="item.name" :label="item.name"></el-option>
      </el-select>
      <el-input placeholder="请输入资产编号查询" style="width: 200px; margin-left: 10px" v-model="no"></el-input>
      <el-button type="info" plain style="margin-left: 10px" @click="load(1)">查询</el-button>
      <el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
    </div>

    <div class="operation" v-if="user.role=='ADMIN'">
      <el-button type="primary" plain @click="handleAdd">新增</el-button>
      <el-button type="danger" plain @click="delBatch">批量删除</el-button>
      <el-button type="info" plain @click="exportData">批量导出</el-button>
      <el-button type="success" plain @click="handleImport">批量导入</el-button>
    </div>

    <div class="table">
      <el-table :data="tableData" strip @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" v-if="user.role=='ADMIN'"></el-table-column>
        <!--        <el-table-column prop="id" label="序号" width="70" align="center" sortable></el-table-column>-->
        <el-table-column prop="no" label="资产编号"></el-table-column>
        <el-table-column prop="name" label="资产名称"></el-table-column>
        <el-table-column prop="category" label="资产分类"></el-table-column>
        <el-table-column prop="secondCategory" label="资产二级分类"></el-table-column>
        <el-table-column prop="img" label="资产图片">
          <template v-slot="scope">
            <el-image v-if="scope.row.img" style="width: 50px" :src="scope.row.img"
                      :preview-src-list="[scope.row.img]"></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="model" label="资产型号"></el-table-column>
        <el-table-column prop="num" label="数量"></el-table-column>
        <el-table-column prop="date" label="购置日期"></el-table-column>
        <el-table-column prop="money" label="初始价值"></el-table-column>
        <el-table-column prop="depreciate" label="折旧方法"></el-table-column>
        <el-table-column prop="departmentName" label="使用部门"></el-table-column>
        <el-table-column prop="staffName" label="责任人"></el-table-column>
        <el-table-column prop="location" label="存放地点"></el-table-column>
        <el-table-column prop="status" label="状态"></el-table-column>
        <el-table-column prop="comment" label="备注"></el-table-column>
        <el-table-column label="操作" align="center" width="100" fixed="right" v-if="user.role=='STAFF'">
          <template v-slot="scope">
            <el-button size="mini" type="primary" plain @click="handleReceive(scope.row.id)">申请领用</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150" fixed="right" v-if="user.role=='ADMIN'">
          <template v-slot="scope">
            <el-button size="mini" type="primary" plain @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" plain @click="del(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
            background
            @current-change="handleCurrentChange"
            :current-page="pageNum"
            :page-sizes="[5, 10, 20]"
            :page-size="pageSize"
            layout="total, prev, pager, next"
            :total="total">
        </el-pagination>
      </div>
    </div>
    <el-dialog title="申请资产" :visible.sync="fromVisible1" width="40%" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="assetsReceive" label-width="100px" style="padding-right: 50px" :rules="assetsReceiveRules"
               ref="assetsReceiveFormRef">
        <el-form-item label="归还日期" prop="returnDate">
          <el-date-picker format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="请选择归还日期"
                          v-model="assetsReceive.returnDate" style="width: 100%"></el-date-picker>
        </el-form-item>
        <el-form-item label="备注" prop="comment">
          <el-input type="textarea" :rows="5" v-model="assetsReceive.comment" placeholder="备注"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="fromVisible1 = false">取 消</el-button>
        <el-button type="primary" @click="saveAssetsReceive">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="资产信息" :visible.sync="fromVisible" width="40%" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="form" label-width="100px" style="padding-right: 50px" :rules="rules" ref="formRef">
        <el-form-item label="资产编号" prop="no">
          <el-input v-model="form.no" placeholder="资产编号"></el-input>
        </el-form-item>
        <el-form-item label="资产名称" prop="name">
          <el-input v-model="form.name" placeholder="资产名称"></el-input>
        </el-form-item>
        <el-form-item label="资产分类" prop="category">
          <el-select style="width: 100%;" v-model="form.category">
            <el-option v-for="item in categoryList" :key="item.id" :value="item.name" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="资产二级分类" prop="secondCategory">
          <el-input v-model="form.secondCategory" placeholder="资产二级分类"></el-input>
        </el-form-item>
        <el-form-item label="资产图片" prop="img">
          <el-upload
              :action="$baseUrl + '/files/upload'"
              :headers="{ token: user.token }"
              list-type="picture"
              :on-success="handleImgSuccess"
          >
            <el-button type="primary">上传</el-button>
          </el-upload>

        </el-form-item>
        <el-form-item label="资产型号" prop="model">
          <el-input v-model="form.model" placeholder="资产型号"></el-input>
        </el-form-item>
        <el-form-item label="数量" prop="num">
          <el-input-number :min="1" v-model="form.num" placeholder="数量"></el-input-number>
        </el-form-item>
        <el-form-item label="购置日期" prop="date">
          <el-date-picker format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                          v-model="form.date" style="width: 100%"></el-date-picker>
        </el-form-item>
        <el-form-item label="初始价值" prop="money">
          <el-input v-model="form.money" placeholder="初始价值"></el-input>
        </el-form-item>
        <el-form-item label="折旧方法" prop="depreciate">
          <el-select style="width: 100%" v-model="form.depreciate">
            <el-option value="平均年限法"></el-option>
            <el-option value="工作量法"></el-option>
            <el-option value="双倍余额递减法"></el-option>
            <el-option value="年度总和法"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="使用部门" prop="departmentIds">

          <el-select ref="selectTree" v-model="form.departmentIds" multiple clearable style="width: 100%;" @clear="handleDeptClear">
            <el-option
                v-for="item in departmentList"
                :key="item.id"
                :value="Number(item.id)"
                :label="item.name"
                style="display: none;"/>
            <el-tree
                ref="deptTree"
                :data="departmentTree"
                :props="{children: 'children', label: 'name'}"
                node-key="id"
                show-checkbox
                :default-checked-keys="form.departmentIds || []"
                @check="handleDeptCheck"
                default-expand-all />
          </el-select>
        </el-form-item>
        <el-form-item label="责任人" prop="staffName">
          <el-input v-model="form.staffName" placeholder="责任人"></el-input>
        </el-form-item>
        <el-form-item label="存放地点" prop="location">
          <el-input v-model="form.location" placeholder="存放地点"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select style="width: 100%" v-model="form.status">
            <el-option value="正常"></el-option>
            <el-option value="停用"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="comment">
          <el-input v-model="form.comment" placeholder="备注"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="fromVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="批量导入" :visible.sync="importVisible" width="40%" :close-on-click-modal="false"
               destroy-on-close>
      <el-form label-width="100px" style="padding-right: 50px">
        <el-form-item label="选择文件">
          <el-upload
              :action="$baseUrl + '/assets/import'"
              :headers="{ token: user.token }"
              :on-success="handleImportSuccess"
              :on-error="handleImportError"
              :before-upload="beforeImportUpload"
              accept=".xlsx,.xls"
              :show-file-list="true"
              :auto-upload="false"
              :limit="1"
              ref="importUpload"
          >
            <el-button slot="trigger" type="primary">选择Excel文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传xlsx/xls文件，且不超过10MB</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="模板下载">
          <el-button type="info" plain @click="downloadTemplate">下载导入模板</el-button>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="importVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitImport">开始导入</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "Assets",
  data() {
    return {
      tableData: [],  // 所有的数据
      pageNum: 1,   // 当前的页码
      pageSize: 10,  // 每页显示的个数
      total: 0,
      name: null,
      category: null,
      no: null,
      fromVisible: false,
      form: {},
      user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
      rules: {
        no: [
          {required: true, message: '请输入编号', trigger: 'blur'}
        ],
        name: [
          {required: true, message: '请输入名称', trigger: 'blur'}
        ],
        category: [
          {required: true, message: '请输入分类', trigger: 'blur'}
        ]
      },
      ids: [],
      staffList: [],
      departmentList:[],
      departmentTree:[],
      categoryList:[],
      assetsReceive: {},
      fromVisible1: false,
      assetsReceiveRules: {
        returnDate: [
          {required: true, message: '请选择归还日期', trigger: 'blur'}
        ],
      },
      importVisible: false
    }
  },
  created() {
    this.load(1)
    this.loadStaff()
    this.loadDepartment()
    this.loadCategory()
  },
  methods: {
    saveAssetsReceive() {
      this.$refs.assetsReceiveFormRef.validate((valid) => {
        if (valid) {
          this.$request.post('/assetsReceive/add', this.assetsReceive).then(res => {
            if (res.code === '200') {
              this.$message.success('申请成功')
              this.load(1)
              this.fromVisible1 = false
            } else {
              this.$message.error(res.msg)
            }
          })
        }
      })
    },
    handleReceive(assetsId) {
      this.fromVisible1 = true
      this.assetsReceive = {assetsId: assetsId}
    },
    exportData() {
      window.open(this.$baseUrl + '/assets/export')
    },
    loadDepartment() {
      // 先查出扁平的部门数组
      this.$request.get('/department/selectAll').then(res => {
        this.departmentList = res.data
      })
      // 再查出树形的部门数组
      this.$request.get('/department/selectTree').then(res => {
        this.departmentTree = res.data
      })
    },
    loadCategory() {
      this.$request.get('/category/selectAll').then(res => {
        this.categoryList = res.data || []
      })
    },
    loadStaff() {
      this.$request.get('/staff/selectAll').then(res => {
        this.staffList = res.data || []
      })
    },
    handleImgSuccess(response, file, fileList) {
      this.form.img = response.data
    },
    handleDeptCheck(data, checked, indeterminate) {
      const rawIds = this.$refs.deptTree ? this.$refs.deptTree.getCheckedKeys() : []
      const ids = rawIds.map(id => Number(id))
      const nodes = this.$refs.deptTree ? this.$refs.deptTree.getCheckedNodes() : []
      const names = nodes.map(n => n.name)
      this.$set(this.form, 'departmentIds', ids)
      this.$set(this.form, 'departmentNames', names)
    },
    handleDeptClear() {
      this.$set(this.form, 'departmentIds', [])
      this.$set(this.form, 'departmentNames', [])
      this.$nextTick(() => {
        this.$refs.deptTree && this.$refs.deptTree.setCheckedKeys(this.form.departmentIds)
      })
    },
    handleAdd() {   // 新增数据
      this.form = {}  // 新增数据的时候清空数据
      this.form.departmentIds = []
      this.form.departmentNames = []
      this.fromVisible = true   // 打开弹窗
      this.$nextTick(() => {
        this.$refs.deptTree && this.$refs.deptTree.setCheckedKeys(this.form.departmentIds)
      })
    },
    handleEdit(row) {   // 编辑数据
      this.form = JSON.parse(JSON.stringify(row))  // 给form对象赋值  注意要深拷贝数据
      const hasIds = Array.isArray(this.form.departmentIds) && this.form.departmentIds.length
      if (!hasIds) {
        const names = Array.isArray(this.form.departmentNames)
          ? this.form.departmentNames
          : (typeof this.form.departmentNames === 'string' && this.form.departmentNames
            ? this.form.departmentNames.split(',').filter(Boolean)
            : (typeof this.form.departmentName === 'string' && this.form.departmentName
              ? this.form.departmentName.split(',').filter(Boolean)
              : []))
        const nameSet = new Set(names)
        const mappedIds = (this.departmentList || []).filter(d => nameSet.has(d.name)).map(d => Number(d.id))
        this.form.departmentIds = mappedIds
      } else {
        this.form.departmentIds = this.form.departmentIds.map(id => Number(id))
      }
      this.fromVisible = true   // 打开弹窗
      this.$nextTick(() => {
        this.$refs.deptTree && this.$refs.deptTree.setCheckedKeys(this.form.departmentIds)
      })
    },
    save() {   // 保存按钮触发的逻辑  它会触发新增或者更新
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          const ids = Array.isArray(this.form.departmentIds) ? this.form.departmentIds : []
          let names = []
          if (this.$refs.deptTree) {
            const nodes = this.$refs.deptTree.getCheckedNodes()
            names = nodes.map(n => n.name)
          } else if (Array.isArray(this.form.departmentNames)) {
            names = this.form.departmentNames
          }
          this.form.departmentIds = ids
          this.form.departmentNames = names
          this.form.departmentName = names.join(',')
          this.$request({
            url: this.form.id ? '/assets/update' : '/assets/add',
            method: this.form.id ? 'PUT' : 'POST',
            data: this.form
          }).then(res => {
            if (res.code === '200') {  // 表示成功保存
              this.$message.success('保存成功')
              this.load(1)
              this.fromVisible = false
            } else {
              this.$message.error(res.msg)  // 弹出错误的信息
            }
          })
        }
      })
    },
    del(id) {   // 单个删除
      this.$confirm('您确定删除吗？', '确认删除', {type: "warning"}).then(response => {
        this.$request.delete('/assets/delete/' + id).then(res => {
          if (res.code === '200') {   // 表示操作成功
            this.$message.success('操作成功')
            this.load(1)
          } else {
            this.$message.error(res.msg)  // 弹出错误的信息
          }
        })
      }).catch(() => {
      })
    },
    handleSelectionChange(rows) {   // 当前选中的所有的行数据
      this.ids = rows.map(v => v.id)
    },
    delBatch() {   // 批量删除
      if (!this.ids.length) {
        this.$message.warning('请选择数据')
        return
      }
      this.$confirm('您确定批量删除这些数据吗？', '确认删除', {type: "warning"}).then(response => {
        this.$request.delete('/assets/delete/batch', {data: this.ids}).then(res => {
          if (res.code === '200') {   // 表示操作成功
            this.$message.success('操作成功')
            this.load(1)
          } else {
            this.$message.error(res.msg)  // 弹出错误的信息
          }
        })
      }).catch(() => {
      })
    },
    load(pageNum) {  // 分页查询
      if (pageNum) this.pageNum = pageNum
      this.$request.get('/assets/selectPage', {
        params: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          name: this.name,
          category: this.category,
          no: this.no,
        }
      }).then(res => {
        if (res.code === '200') {
          this.tableData = res.data?.list
          this.total = res.data?.total
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    reset() {
      this.name = null
      this.category = null
      this.no = null
      this.load(1)
    },
    handleCurrentChange(pageNum) {
      this.load(pageNum)
    },
    handleImport() {
      this.importVisible = true
      this.$nextTick(() => {
        this.$refs.importUpload.clearFiles()
      })
    },
    beforeImportUpload(file) {
      // 检查文件类型
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') ||
          file.name.endsWith('.xls')

      if (!isExcel) {
        this.$message.error('只能上传Excel文件!')
        return false
      }

      // 检查文件大小 (10MB)
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        this.$message.error('文件大小不能超过10MB!')
        return false
      }

      this.$message.success('文件选择成功，请点击"开始导入"按钮')
      return false // 阻止自动上传
    },
    handleImportSuccess(response, file, fileList) {
      // 这个方法现在不会被调用，因为我们使用手动上传
    },
    handleImportError(err, file, fileList) {
      // 这个方法现在不会被调用，因为我们使用手动上传
    },
    downloadTemplate() {
      window.open(this.$baseUrl + '/assets/import/template')
    },
    submitImport() {
      const fileList = this.$refs.importUpload.uploadFiles
      if (!fileList || fileList.length === 0) {
        this.$message.warning('请选择要导入的Excel文件')
        return
      }

      // 手动创建FormData并发送请求
      const formData = new FormData()
      formData.append('file', fileList[0].raw)

      this.$request.post('/assets/import', formData, {
        headers: {
          'token': this.user.token
        }
      }).then(res => {
        if (res.code === '200') {
          this.$message.success(res.msg || '导入成功')
          this.load(1)
          this.importVisible = false
          this.$refs.importUpload.clearFiles()
        } else {
          this.$message.error(res.msg || '导入失败')
        }
      }).catch(err => {
        this.$message.error('导入失败，请检查文件格式或联系管理员')
      })
    }
  }
}
</script>

<style scoped>

</style>