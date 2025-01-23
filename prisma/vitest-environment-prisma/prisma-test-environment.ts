import { ContextTestEnvironment } from 'vitest'

export default <ContextTestEnvironment>{
  name: 'prisma',
  transformMode: 'ssr',
  options: {},

  async setup() {
    console.log('Executing setup...')

    return {
      async teardown() {
        console.log('Executing teardown...')
      },
    }
  },
}
