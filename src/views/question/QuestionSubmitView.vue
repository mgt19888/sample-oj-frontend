<template>
  <div id="questionSubmitView">
    <a-form :model="searchParams" layout="inline">
      <a-form-item field="questionId" label="题号" style="min-width: 240px">
        <a-input v-model="searchParams.questionId" placeholder="请输入" />
      </a-form-item>
      <a-form-item field="language" label="编程语言" style="min-width: 240px">
        <a-select
          v-model="searchParams.language"
          :style="{ width: '320px' }"
          placeholder="选择编程语言"
        >
          <a-option>java</a-option>
          <a-option>cpp</a-option>
          <a-option>go</a-option>
          <a-option>html</a-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="doSubmit">搜索</a-button>
      </a-form-item>
    </a-form>
    <a-divider size="0" />
    <a-table
      :ref="tableRef"
      :columns="columns"
      :data="dataList"
      :pagination="{
        showTotal: true,
        pageSize: searchParams.pageSize,
        current: searchParams.current,
        total,
      }"
      @page-change="onPageChange"
    >
      <template #status="{ record }">
        <a-space wrap>
          <a-tag color="blue">{{ status_dict[record.status] }} </a-tag>
        </a-space>
      </template>
      <template #judgeResult="{ record }">
        <a-space wrap>
          <a-tag v-if="record.judgeInfo.message == 'Accepted'" color="green"
            >{{ record.judgeInfo.message }}
          </a-tag>
          <a-tag v-else color="red">{{ record.judgeInfo.message }} </a-tag>
        </a-space>
      </template>
      <template #judgeTime="{ record }">
        {{ record.judgeInfo.time }}
      </template>
      <template #judgeMemory="{ record }">
        {{ parseInt((record.judgeInfo.memory / 1000).toString()) }}
      </template>
      <template #createTime="{ record }">
        {{
          moment(record.createTime)
            .tz(moment.tz.guess())
            .subtract(8, "hours") //解决部署服务器后多8小时的问题，如果是本地部署可删除
            .format("YYYY-MM-DD HH:mm")
        }}
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watchEffect } from "vue";
import {
  Question,
  QuestionControllerService,
  QuestionSubmitQueryRequest,
} from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
// import moment from "moment";
import moment from "moment-timezone";

// 设置服务器时区
moment.tz.setDefault("UTC");

const tableRef = ref();

const dataList = ref([]);
const total = ref(0);
const searchParams = ref<QuestionSubmitQueryRequest>({
  questionId: undefined,
  language: undefined,
  pageSize: 10,
  current: 1,
});

const status_dict = ref({
  0: "等待中",
  1: "判题中",
  2: "成功",
  3: "失败",
});

// 定义一个计时器的标志
const timerId = ref();

const loadData = async () => {
  const res = await QuestionControllerService.listQuestionSubmitByPageUsingPost(
    {
      ...searchParams.value,
      sortField: "createTime",
      sortOrder: "descend",
    }
  );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
  } else {
    message.error("加载失败，" + res.message);
  }
};

/**
 * 监听 searchParams 变量，改变时触发页面的重新加载
 */
watchEffect(() => {
  loadData();
});

/**
 * 页面加载时，请求数据
 */
onMounted(() => {
  loadData();
  timerId.value = setInterval(() => {
    loadData();
  }, 10000); // 10秒刷新一次
});

// 在组件销毁时清除定时器
onUnmounted(() => {
  if (timerId.value !== null) {
    clearInterval(timerId.value);
  }
});

const columns = [
  // {
  //   title: "提交号",
  //   dataIndex: "id",
  // },
  {
    title: "编程语言",
    dataIndex: "language",
  },
  {
    title: "判题状态",
    slotName: "status",
  },
  {
    title: "判题结果",
    slotName: "judgeResult",
  },
  {
    title: "运行时间（MS）",
    slotName: "judgeTime",
  },
  {
    title: "运行内存（KB）",
    slotName: "judgeMemory",
  },
  // {
  //   title: "判题信息",
  //   slotName: "judgeInfo",
  // },
  {
    title: "题目 id",
    dataIndex: "questionId",
  },
  {
    title: "提交者 id",
    dataIndex: "userId",
  },
  {
    title: "创建时间",
    slotName: "createTime",
  },
];

const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page,
  };
};

const router = useRouter();

/**
 * 跳转到做题页面
 * @param question
 */
const toQuestionPage = (question: Question) => {
  router.push({
    path: `/view/question/${question.id}`,
  });
};

/**
 * 确认搜索，重新加载数据
 */
const doSubmit = () => {
  // 这里需要重置搜索页号
  searchParams.value = {
    ...searchParams.value,
    current: 1,
  };
};
</script>

<style scoped>
#questionSubmitView {
  max-width: 1280px;
  margin: 0 auto;
}
</style>
