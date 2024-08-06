import { computed, onMounted, watch, ComputedRef } from 'vue'
import { useRouter } from "vue-router";
import useParentMainRouter from '@/composables/useParentMainRouter'

export interface QueryParams {
  page: number;
  perPage: number;
}

export type PushQuery<T> = (param: Partial<T>) => void;

export interface Response<T> {
  queryParams: ComputedRef<T>;
  pushQuery: PushQuery<T>;
}

export default function useQueryList<T extends QueryParams>(verifyRoutePath: string, cb: (queryParams: T, pushQuery: PushQuery<T>) => any): Response<T> {
  const pRouter = useParentMainRouter();
  const router = useRouter();

  const queryParams = computed<T>(() => {
    const { perPage = 10, page = 1, ...other } = router.currentRoute.value.query;
    return { perPage: Number(perPage), page: Number(page), ...other } as T;
  })

  const pushQuery = (param: Partial<T>): void => {
    router.currentRoute.value.query = {}
    if (!pRouter) {
      router.push({
        ...router.currentRoute.value,
        query: {
          ...router.currentRoute.value.query,
          ...param
        }
      })
    } else {
      const baseLen = pRouter.options.history.base.length;
      const pHref = router.resolve({
        ...router.currentRoute.value,
        query: {
          ...router.currentRoute.value.query,
          ...param
        }
      }).href.substring(baseLen)
      pRouter.push(pHref)
    }
  }

  const verify = () => {
    if (router.currentRoute.value.path !== verifyRoutePath) {
      return false
    }
    cb(queryParams.value, pushQuery)
  }

  watch<T>(queryParams, () => {
    verify();
  })

  onMounted(() => {
    verify();
  })

  return {
    queryParams,
    pushQuery
  }
}
