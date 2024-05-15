export type User = {
    id: number,
    username: string
    name: string
    age: number
    social: string
    password: string
  }

export const users: User[] = [
    {
      id: 1,
      name: 'Lucas',
      age: 27,
      social: 'twitter.lsantos.dev',
      username: 'lsantosdev',
      password: '123456'
    },
    {
      id: 2,
      name: 'Rosa',
      age: 33,
      social: 'http://ko.st/wa',
      username: 'rosabarnett',
      password: '123456'
    },
    {
      id: 3,
      name: 'Russell',
      age: 66,
      social: 'http://egki.tp/ecbu',
      username: 'russellspencer',
      password: '123456'
    }
  ]