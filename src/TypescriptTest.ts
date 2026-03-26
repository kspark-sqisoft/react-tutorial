const a: number = 1;
console.log(a);

const user: { id: number; name: string } = {
  id: 1,
  name: "John",
};
console.log(user);

// 타입 별칭
type User = {
  id: number;
  name: string;
};
const user2: User = {
  id: 1,
  name: "John",
};

interface User3 {
  id: number;
  name: string;
}
const user3: User3 = {
  id: 1,
  name: "John",
};
//인덱스 시그니쳐
type CountryCodes = {
  [key: string]: string;
};
const countryCodes: CountryCodes = {
  KR: "Korea",
  US: "United States",
  JP: "Japan",
};
console.log(countryCodes);

// 함수 타입 표현식
type Add = (a: number, b: number) => number;
const add: Add = (a, b) => a + b;
add(1, 2);

// 호출 시그니처
type Add2 = {
  (a: number, b: number): number;
};

const add2: Add2 = (a, b) => a + b;
add2(1, 2);

//Promise는 “선언하는 순간 실행된다”
const promise: Promise<string> = new Promise<string>((resolve, reject) => {
  setTimeout(() => {
    const isSuccess = Math.random() > 0.5;

    if (isSuccess) {
      resolve("성공: 2초 후 반환");
    } else {
      reject("실패: 에러 발생");
    }
  }, 2000);
});

promise.then((res) => console.log(res)).catch((err) => console.error(err));

function createPromise(): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const isSuccess = Math.random() > 0.5;

      if (isSuccess) {
        resolve("성공: 2초 후 반환");
      } else {
        reject(new Error("실패: 에러 발생"));
      }
    }, 2000);
  });
}

async function run() {
  try {
    const res = await createPromise();
    console.log(res);
  } catch (err) {
    console.error(err);
  }
}

run();
