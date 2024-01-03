// initial state
import { StoreOptions } from "vuex";
import ACCESS_ENUM from "@/access/accessEnum";
import { UserControllerService } from "../../generated";

export default {
  namespaced: true,
  state: () => ({
    loginUser: {
      userName: "未登录",
    },
  }),
  actions: {
    async getLoginUser({ commit, state }, payload) {
      try {
        // 从远程请求获取登录信息
        const res = await UserControllerService.getLoginUserUsingGet();
        if (res.code === 0) {
          commit("updateUser", res.data);
        } else {
          commit("updateUser", {
            ...state.loginUser,
            userRole: ACCESS_ENUM.NOT_LOGIN,
          });
        }
      } catch (error) {
        console.error("获取登录用户时出错：", error);
        // 可以根据需要处理错误，例如弹出错误提示
      }
    },
  },
  mutations: {
    updateUser(state, payload) {
      state.loginUser = payload;
    },
  },
} as StoreOptions<any>;
