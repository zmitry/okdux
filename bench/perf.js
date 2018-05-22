var Benchmark = require("benchmark");
var suite = new Benchmark.Suite();

var fn = () => 5;
var proxy = data => {
  return new Proxy(data, {
    get(target, key) {
      fn();
      return target[key];
    }
  });
};

const data2 = () => ({
  ui: { a: { b: 5 } },
  password: { hash: "", data: "" },
  name: "",
  ke: { a: 5 },
  d: 6,
  name2: "",
  ke3: { a: 5 },
  d5: 6,
  name62: "",
  ke35: { a: 5 },
  d54: 6,
  name626: "",
  ke385: { a: 5 },
  d548: 6
});

const data3 = () => {
  return new Array(10).fill(0).reduce((acc, _, el) => {
    acc[el] = {};
    return acc;
  }, {});
};
console.log(data3());
const getters = obj => {
  for (let i in obj) {
    const value = obj[i];
    Object.defineProperty(obj, i, {
      get() {
        fn();
        return value;
      }
    });
  }
  return obj;
};
const proxyObj = proxy(data2());
const gettersObj = getters(data2());

// add tests
suite
  .add("access proxy", function() {
    const t = proxyObj.a;
    return { t };
  })
  .add("access getters", function() {
    const t = gettersObj.a;
    return { t };
  })
  .add("create proxy and access", function() {
    const data = proxy(data2());
    return data.ui;
  })
  .add("wrap by getters and access", function() {
    const data = getters(data2());
    return data.ui;
  })
  .on("cycle", function(event) {
    console.log(String(event.target));
  })
  .on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  .run();
