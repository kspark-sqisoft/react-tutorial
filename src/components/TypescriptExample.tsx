type Lesson = {
  no: number;
  title: string;
  code: string;
};

type CourseSection = {
  sectionNo: number;
  title: string;
  lessons: Lesson[];
};

const COURSE: CourseSection[] = [
  {
    sectionNo: 2,
    title: "타입스크립트 기초",
    lessons: [
      {
        no: 12,
        title: "기본 용어들",
        code: `// 값(value) vs 타입(type)
const n = 42; // 값
type Num = number; // 타입 별칭

// 타입 어노테이션: 변수에 타입을 붙임
const x: number = 1;
let s: string = "hi";

// typeof: 런타임 연산자(JS) / 타입 쿼리(TS)
type T = typeof n; // T는 number`,
      },
      {
        no: 13,
        title: "기본 타입",
        code: `let a: number = 1;
let b: string = "text";
let c: boolean = true;
let d: null = null;
let e: undefined = undefined;
let sym: symbol = Symbol("id");
let big: bigint = 10n;`,
      },
      {
        no: 14,
        title: "객체 타입",
        code: `type User = {
  name: string;
  age: number;
};

const u: User = { name: "Kim", age: 20 };`,
      },
      {
        no: 15,
        title: "빈 객체 주의",
        code: `// {} 는 "비어 있지 않은 객체"에 가깝게 취급될 수 있음
const o: {} = { x: 1 }; // 허용(구조적 타이핑)

// "아무 속성도 없음"을 원하면:
type EmptyObject = Record<string, never>;
// 또는 엄격한 lint 규칙으로 빈 객체 남용 방지`,
      },
      {
        no: 16,
        title: "함수 선언문 타입",
        code: `function add(a: number, b: number): number {
  return a + b;
}`,
      },
      {
        no: 17,
        title: "함수 표현식 타입",
        code: `const mul: (a: number, b: number) => number = (a, b) => a * b;

// 별칭으로 시그니처 재사용
type Binary = (x: number, y: number) => number;
const sub: Binary = (x, y) => x - y;`,
      },
      {
        no: 18,
        title: "배열 타입",
        code: `const nums: number[] = [1, 2, 3];
const names: Array<string> = ["a", "b"];

// 읽기 전용 배열
const ro: readonly number[] = [1, 2];`,
      },
      {
        no: 19,
        title: "객체 타입 - 심화",
        code: `type Point = { x: number; y: number };
type Circle = { center: Point; radius: number };

// 중첩·조합으로 모델링
const c: Circle = { center: { x: 0, y: 0 }, radius: 5 };`,
      },
      {
        no: 20,
        title: "옵셔널 속성 (기초)",
        code: `type Post = {
  title: string;
  subtitle?: string; // 있어도 되고 없어도 됨
};

const p1: Post = { title: "A" };
const p2: Post = { title: "B", subtitle: "b" };`,
      },
    ],
  },
  {
    sectionNo: 3,
    title: "특별한 타입",
    lessons: [
      {
        no: 21,
        title: "any",
        code: `let v: any = 1;
v = "x"; // 검사 무력화 — 지양
// 대안: unknown + 좁히기`,
      },
      {
        no: 22,
        title: "unknown",
        code: `function safeLen(x: unknown) {
  if (typeof x === "string") return x.length;
  return 0;
}`,
      },
      {
        no: 23,
        title: "never",
        code: `// 도달 불가능한 값의 타입
function fail(msg: string): never {
  throw new Error(msg);
}

// exhaustive check에서 남는 경우를 never로
type Shape = { kind: "c" } | { kind: "s" };
function area(s: Shape): number {
  switch (s.kind) {
    case "c": return 1;
    case "s": return 2;
    default: {
      const _exhaustive: never = s;
      return _exhaustive;
    }
  }
}`,
      },
      {
        no: 24,
        title: "유니온 타입",
        code: `type Id = string | number;
let id: Id = "a";
id = 10;

// 좁히기
function printId(id: Id) {
  if (typeof id === "number") console.log(id.toFixed(0));
  else console.log(id.toUpperCase());
}`,
      },
      {
        no: 25,
        title: "인터섹션 타입",
        code: `type A = { a: number };
type B = { b: string };
type AB = A & B;

const x: AB = { a: 1, b: "z" };`,
      },
    ],
  },
  {
    sectionNo: 4,
    title: "타입추론",
    lessons: [
      {
        no: 26,
        title: "타입추론(Type Annotations)",
        code: `// 어노테이션: 개발자가 명시
const a: number = 1;

// 추론: 초기값으로 타입 결정
const b = 1; // number`,
      },
      {
        no: 27,
        title: "타입추론 - 기본, 참조 자료형",
        code: `// 리터럴은 보통 넓혀짐(widening)
let n = 1; // number
const m = 1; // 1 (리터럴 타입)

// 배열은 요소 기준
const arr = [1, "a"]; // (string | number)[]`,
      },
      {
        no: 28,
        title: "타입추론 - undefined, null",
        code: `// strictNullChecks 켜면 null/undefined는 별도 타입
let u: string | undefined;
u = undefined;

function f(x?: string) {
  // x는 string | undefined
}`,
      },
      {
        no: 29,
        title: "타입추론 - 함수 관점",
        code: `// 반환 타입 추론
function add(a: number, b: number) {
  return a + b; // number
}

// 컨텍스트 타이핑: 콜백 인자 추론
[1, 2].map((n) => n * 2);`,
      },
      {
        no: 30,
        title: "타입추론 - 리터럴 타입 1",
        code: `const kind = "ok" as const; // "ok"
let loose = "ok"; // string`,
      },
      {
        no: 31,
        title: "타입 추론 - 리터럴 타입 2",
        code: `const cfg = {
  mode: "dev" as const,
  port: 3000,
} as const;
// cfg.mode: "dev", cfg.port: 3000`,
      },
      {
        no: 32,
        title: "타입추론 - 주의할 점",
        code: `// any로 오염되면 추론이 무너짐
let x: any = 1;
let y = x; // any

// 빈 배열 초기화는 any[] 될 수 있음 — 제네릭/어노테이션 권장
const xs: number[] = [];`,
      },
    ],
  },
  {
    sectionNo: 5,
    title: "함수 톺아보기",
    lessons: [
      {
        no: 33,
        title: "함수 시그니처",
        code: `type Fn = (a: string, b?: number) => boolean;
// 선택 매개변수, 반환 boolean`,
      },
      {
        no: 34,
        title: "함수 표현식의 시그니처",
        code: `type Parse = (input: string) => number;
const parse: Parse = (s) => Number(s);`,
      },
      {
        no: 35,
        title: "객체 리터럴에서의 함수 시그니처",
        code: `type API = {
  get(path: string): Promise<unknown>;
};

const api: API = {
  async get(path) {
    return fetch(path).then((r) => r.json());
  },
};`,
      },
      {
        no: 36,
        title: "콜백 함수의 시그니처",
        code: `function map<T, U>(arr: T[], fn: (item: T, i: number) => U): U[] {
  return arr.map(fn);
}`,
      },
      {
        no: 37,
        title: "콜백 함수에서 더 살펴보기",
        code: `// this 타입 지정(메서드 스타일 콜백에서 유용)
type ClickHandler = (this: HTMLElement, e: MouseEvent) => void;`,
      },
      {
        no: 38,
        title: "함수 오버로드 1",
        code: `function parseInput(x: string): number;
function parseInput(x: boolean): 0 | 1;
function parseInput(x: string | boolean) {
  if (typeof x === "string") return Number(x);
  return x ? 1 : 0;
}`,
      },
      {
        no: 39,
        title: "함수 오버로드 2",
        code: `// 구현 시그니처는 public 시그니처와 호환되어야 함
function fmt(v: string): string;
function fmt(v: number): string;
function fmt(v: string | number) {
  return String(v);
}`,
      },
    ],
  },
  {
    sectionNo: 6,
    title: "타입가드와 타입단언",
    lessons: [
      {
        no: 40,
        title: "타입가드란?",
        code: `function isString(x: unknown): x is string {
  return typeof x === "string";
}

function len(x: unknown) {
  if (isString(x)) return x.length;
  return 0;
}`,
      },
      {
        no: 41,
        title: "타입가드 주의할 점",
        code: `// 커스텀 가드는 논리와 일치해야 함(거짓이면 런타임 버그)
function isNum(x: unknown): x is number {
  return typeof x === "number";
}
// Array.isArray 등 내장 패턴 활용 권장`,
      },
      {
        no: 42,
        title: "타입가드 확장",
        code: `type Dog = { kind: "dog"; bark(): void };
type Cat = { kind: "cat"; meow(): void };

function isDog(a: Dog | Cat): a is Dog {
  return a.kind === "dog";
}`,
      },
      {
        no: 43,
        title: "타입단언",
        code: `const el = document.getElementById("root");
// 개발자 보장: 비null
const root = el as HTMLElement;

// 각도(각주): JSX 외부에서만
// const x = y as unknown as Target; // 이중 단언(최후 수단)`,
      },
      {
        no: 44,
        title: "널 아님 단언연산자",
        code: `// 값이 null/undefined가 아님을 단언
function f(s?: string) {
  return s!.toUpperCase(); // 런타임에서 s가 없으면 크래시
}`,
      },
    ],
  },
  {
    sectionNo: 7,
    title: "객체 타입 톺아보기",
    lessons: [
      {
        no: 45,
        title: "객체 타입 복습",
        code: `type Box<T> = { value: T };
const n: Box<number> = { value: 1 };`,
      },
      {
        no: 46,
        title: "옵셔널 속성",
        code: `type U = { name: string; nick?: string };
const a: U = { name: "Lee" };`,
      },
      {
        no: 47,
        title: "옵셔널 속성 주의점",
        code: `// optional을 곧 "항상 키가 있다"로 착각 금지
type T = { x?: number };
const o: T = {}; // x 없음 OK — 사용 전 확인`,
      },
      {
        no: 48,
        title: "readonly",
        code: `type RO = { readonly id: string; name: string };
const u: RO = { id: "1", name: "A" };
// u.id = "2"; // 오류`,
      },
      {
        no: 49,
        title: "객체 타입으로 함수 시그니처 지정하기",
        code: `type Obj = {
  (n: number): string;
  label: string;
};

const twice: Obj = Object.assign((n: number) => String(n * 2), {
  label: "x2",
});`,
      },
      {
        no: 50,
        title: "인덱스 시그니처",
        code: `type Dict = { [key: string]: number };
const d: Dict = { a: 1, b: 2 };`,
      },
      {
        no: 51,
        title: "인덱스 시그니처 주의점",
        code: `// 인덱스 시그니처가 있으면 모든 명시 속성이 그 값 타입에 할당 가능해야 함
type Bad = { a: string; [k: string]: number }; // a 충돌 가능

type Good = { [k: string]: string | number; a: string };`,
      },
    ],
  },
  {
    sectionNo: 8,
    title: "인터페이스",
    lessons: [
      {
        no: 52,
        title: "객체 타입의 문제점",
        code: `// type 별칭은 확장 시 교차(&) 등으로 조합
type A = { x: number };
type B = A & { y: string };

// 인터페이스는 선언 병합 등 다른 이점`,
      },
      {
        no: 53,
        title: "인터페이스란?",
        code: `interface User {
  id: string;
  name: string;
}`,
      },
      {
        no: 54,
        title: "인터페이스에 대한 오해",
        code: `// TS의 구조적 타이핑: "이름"이 아니라 "형태"
interface Point {
  x: number;
  y: number;
}
function usePoint(p: Point) {
  return p.x + p.y;
}
usePoint({ x: 1, y: 2, z: 3 }); // excess property는 변수로 넘길 때 별도 체크`,
      },
      {
        no: 55,
        title: "인터페이스와 옵셔널 속성",
        code: `interface Opt {
  a: number;
  b?: string;
}`,
      },
      {
        no: 56,
        title: "인터페이스와 읽기 전용 속성",
        code: `interface RO {
  readonly id: string;
  name: string;
}`,
      },
      {
        no: 57,
        title: "인터페이스와 함수 시그니처",
        code: `interface Logger {
  (msg: string): void;
  level: "info" | "error";
}`,
      },
      {
        no: 58,
        title: "인터페이스와 인덱스 시그니처",
        code: `interface NumMap {
  [key: string]: number;
  a: number;
}`,
      },
      {
        no: 59,
        title: "인터페이스 병합",
        code: `interface Window {
  myLib?: { version: string };
}
// 같은 이름 interface를 여러 번 선언하면 합쳐짐`,
      },
      {
        no: 60,
        title: "인터페이스 상속 1",
        code: `interface Animal {
  name: string;
}
interface Dog extends Animal {
  bark(): void;
}`,
      },
      {
        no: 61,
        title: "인터페이스 상속 2",
        code: `interface A {
  x: number;
}
interface B extends A {
  y: number;
}`,
      },
      {
        no: 62,
        title: "인터페이스 다중 상속",
        code: `interface A {
  a: number;
}
interface B {
  b: string;
}
interface C extends A, B {
  c: boolean;
}`,
      },
      {
        no: 63,
        title: "인터페이스 선택적 상속",
        code: `// extends는 필수. 선택 필드는 base에 ? 로 표현
interface Base {
  id: string;
  desc?: string;
}
interface Item extends Base {
  title: string;
}`,
      },
      {
        no: 64,
        title: "구조적 타이핑",
        code: `interface Vector2 {
  x: number;
  y: number;
}
function sum(v: Vector2) {
  return v.x + v.y;
}
sum({ x: 1, y: 2 }); // 이름이 아니라 구조가 맞으면 OK`,
      },
    ],
  },
  {
    sectionNo: 9,
    title: "타입별칭",
    lessons: [
      {
        no: 65,
        title: "타입별칭이란?",
        code: `type UserId = string;
type Coord = readonly [number, number];`,
      },
      {
        no: 66,
        title: "타입별칭과 객체",
        code: `type UserId = string;
type User = {
  id: UserId;
  name: string;
};`,
      },
      {
        no: 67,
        title: "타입별칭의 병합과 상속",
        code: `type A = { a: number };
type B = { b: string };
type AB = A & B; // 교차로 "병합"`,
      },
      {
        no: 68,
        title: "타입별칭과 인터페이스의 상호작용 - 1",
        code: `interface I {
  x: number;
}
type T = I & { y: string };`,
      },
      {
        no: 69,
        title: "타입별칭과 인터페이스의 상호작용 - 2",
        code: `type Props = {
  id: string;
};
interface PageProps extends Props {
  title: string;
}`,
      },
    ],
  },
  {
    sectionNo: 10,
    title: "클래스",
    lessons: [
      {
        no: 70,
        title: "클래스란?",
        code: `class Greeter {
  message: string;
  constructor(message: string) {
    this.message = message;
  }
  greet() {
    return "Hello, " + this.message;
  }
}`,
      },
      {
        no: 71,
        title: "타입스크립트 클래스",
        code: `class Point {
  constructor(public x: number, public y: number) {}
  move(dx: number, dy: number) {
    return new Point(this.x + dx, this.y + dy);
  }
}`,
      },
      {
        no: 72,
        title: "접근제어자",
        code: `class Account {
  public name: string;
  private balance = 0;
  protected pin: string;
  constructor(name: string, pin: string) {
    this.name = name;
    this.pin = pin;
  }
}`,
      },
      {
        no: 73,
        title: "추상 클래스 - 1",
        code: `abstract class Shape {
  abstract area(): number;
}`,
      },
      {
        no: 74,
        title: "추상 클래스 - 2",
        code: `abstract class Shape {
  abstract area(): number;
}
class Square extends Shape {
  constructor(private side: number) {
    super();
  }
  area() {
    return this.side ** 2;
  }
}`,
      },
      {
        no: 75,
        title: "class와 readonly",
        code: `class User {
  readonly id: string;
  constructor(id: string) {
    this.id = id;
  }
}`,
      },
      {
        no: 76,
        title: "implements 1",
        code: `interface Serializable {
  toJSON(): string;
}
class M implements Serializable {
  toJSON() {
    return "{}";
  }
}`,
      },
      {
        no: 77,
        title: "implements 2",
        code: `interface Drawable {
  draw(): void;
}
interface Movable {
  move(dx: number, dy: number): void;
}
class Sprite implements Drawable, Movable {
  draw() {}
  move() {}
}`,
      },
      {
        no: 78,
        title: "implements 3",
        code: `// implements는 구조 검사일 뿐, 런타임 인터페이스는 없음
interface Clock {
  now(): Date;
}
class SystemClock implements Clock {
  now() {
    return new Date();
  }
}`,
      },
    ],
  },
  {
    sectionNo: 11,
    title: "제네릭",
    lessons: [
      {
        no: 79,
        title: "제네릭",
        code: `function identity<T>(x: T): T {
  return x;
}
const n = identity(1);`,
      },
      {
        no: 80,
        title: "제네릭 + 함수 1",
        code: `function first<T>(arr: T[]): T | undefined {
  return arr[0];
}`,
      },
      {
        no: 81,
        title: "제네릭 + 함수 2",
        code: `function pair<T, U>(a: T, b: U): [T, U] {
  return [a, b];
}`,
      },
      {
        no: 82,
        title: "제네릭 + 인터페이스",
        code: `interface ApiResponse<T> {
  data: T;
  ok: boolean;
}`,
      },
      {
        no: 83,
        title: "제네릭 + 타입별칭",
        code: `type Tree<T> = {
  value: T;
  children?: Tree<T>[];
};`,
      },
      {
        no: 84,
        title: "제네릭 + 클래스",
        code: `class Box<T> {
  constructor(public value: T) {}
}`,
      },
      {
        no: 85,
        title: "제네릭 + 타입제약",
        code: `function keys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}`,
      },
      {
        no: 86,
        title: "제네릭 + 타입제약 2",
        code: `type HasId = { id: string };
function byId<T extends HasId>(items: T[], id: string) {
  return items.find((i) => i.id === id);
}`,
      },
      {
        no: 87,
        title: "조건부 타입",
        code: `type IsString<T> = T extends string ? true : false;
type A = IsString<"x">; // true`,
      },
      {
        no: 88,
        title: "infer",
        code: `type ElementType<T> = T extends (infer U)[] ? U : T;
type N = ElementType<number[]>; // number`,
      },
    ],
  },
  {
    sectionNo: 12,
    title: "유틸리티 타입",
    lessons: [
      {
        no: 89,
        title: "Partial<T>",
        code: `type User = { id: string; name: string };
type Patch = Partial<User>; // 모든 속성 optional`,
      },
      {
        no: 90,
        title: "Required<T>",
        code: `type U = { a?: string };
type R = Required<U>; // a: string`,
      },
      {
        no: 91,
        title: "Readonly<T>",
        code: `type RO = Readonly<{ x: number; y: number }>;`,
      },
      {
        no: 92,
        title: "Record<T>",
        code: `// 표준: Record<Keys, Value>
type Role = "admin" | "user";
type Perms = Record<Role, string[]>;`,
      },
      {
        no: 93,
        title: "Pick<T>",
        code: `type User = { id: string; name: string; age: number };
type PublicUser = Pick<User, "id" | "name">;`,
      },
      {
        no: 94,
        title: "Omit<T>",
        code: `type User = { id: string; name: string; password: string };
type Safe = Omit<User, "password">;`,
      },
      {
        no: 95,
        title: "Exclude<T>",
        code: `type T = "a" | "b" | "c";
type NoA = Exclude<T, "a">; // "b" | "c"`,
      },
      {
        no: 96,
        title: "Extract<T>",
        code: `type T = "a" | "b" | 1;
type OnlyStr = Extract<T, string>; // "a" | "b"`,
      },
    ],
  },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-950 p-4 text-left text-xs leading-relaxed text-zinc-100 dark:border-zinc-800">
      <code>{children.trim()}</code>
    </pre>
  );
}

const TypescriptExample = () => {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <header className="mb-10 border-b border-zinc-200 pb-8 dark:border-zinc-800">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            TypeScript 강의 노트
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            섹션 2–12 · 예시 코드 모음
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            각 강 번호(12–96) 순서에 맞춰 요약 예제만 담았습니다. 실제 강의와
            함께 보시면 됩니다.
          </p>
        </header>

        <nav
          aria-label="섹션 목차"
          className="mb-12 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            목차
          </h2>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2">
            {COURSE.map((sec) => (
              <li key={sec.sectionNo}>
                <a
                  className="text-sm text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                  href={`#section-${sec.sectionNo}`}
                >
                  섹션 {sec.sectionNo}. {sec.title}
                </a>
                <span className="ml-2 text-xs text-zinc-500">
                  ({sec.lessons.length}개)
                </span>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-16">
          {COURSE.map((sec) => (
            <section
              key={sec.sectionNo}
              className="scroll-mt-24"
              id={`section-${sec.sectionNo}`}
            >
              <div className="mb-6 flex flex-wrap items-baseline gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-800">
                <h2 className="text-xl font-semibold">
                  섹션 {sec.sectionNo}. {sec.title}
                </h2>
                <span className="text-sm text-zinc-500">
                  {sec.lessons.length}개
                </span>
              </div>

              <ul className="space-y-10">
                {sec.lessons.map((lesson) => (
                  <li key={lesson.no}>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-7 min-w-8 items-center justify-center rounded-md bg-zinc-200 px-2 text-xs font-semibold tabular-nums dark:bg-zinc-800">
                        {lesson.no}
                      </span>
                      <h3 className="text-base font-medium">{lesson.title}</h3>
                    </div>
                    <CodeBlock>{lesson.code}</CodeBlock>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TypescriptExample;
