import { inject } from 'vue'

export default function useParentMainRouter(): any {
  return inject('parentRouter')
}
