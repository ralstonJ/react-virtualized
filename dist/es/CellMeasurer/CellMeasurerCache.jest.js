import CellMeasurerCache, { DEFAULT_HEIGHT, DEFAULT_WIDTH } from "./CellMeasurerCache";

describe("CellMeasurerCache", function () {
  it("should override defaultHeight/defaultWidth if minHeight/minWidth are greater", function () {
    var cache = new CellMeasurerCache({
      defaultHeight: 20,
      defaultWidth: 100,
      fixedHeight: true,
      fixedWidth: true,
      minHeight: 30,
      minWidth: 150
    });
    cache.set(0, 0, 50, 10);
    expect(cache.getHeight(0, 0)).toBe(30);
    expect(cache.getWidth(0, 0)).toBe(150);
    expect(cache.rowHeight({ index: 0 })).toBe(30);
    expect(cache.columnWidth({ index: 0 })).toBe(150);
  });

  it("should correctly report cache status", function () {
    var cache = new CellMeasurerCache({
      fixedHeight: true,
      fixedWidth: true
    });
    expect(cache.has(0, 0)).toBe(false);
  });

  it("should cache cells", function () {
    var cache = new CellMeasurerCache({
      fixedHeight: true,
      fixedWidth: true
    });
    cache.set(0, 0, 100, 20);
    expect(cache.has(0, 0)).toBe(true);
  });

  it("should return the correct default sizes for uncached cells if specified", function () {
    spyOn(console, "warn"); // Ignore warning about variable width and height

    var cache = new CellMeasurerCache({
      defaultHeight: 20,
      defaultWidth: 100,
      minHeight: 15,
      minWidth: 80
    });
    expect(cache.getWidth(0, 0)).toBe(100);
    expect(cache.getHeight(0, 0)).toBe(20);
    cache.set(0, 0, 70, 10);
    expect(cache.getWidth(0, 0)).toBe(80);
    expect(cache.getHeight(0, 0)).toBe(15);
  });

  it("should clear a single cached cell", function () {
    var cache = new CellMeasurerCache({
      fixedHeight: true,
      fixedWidth: true
    });
    cache.set(0, 0, 100, 20);
    cache.set(1, 0, 100, 20);
    expect(cache.has(0, 0)).toBe(true);
    expect(cache.has(1, 0)).toBe(true);
    cache.clear(0, 0);
    expect(cache.has(0, 0)).toBe(false);
    expect(cache.has(1, 0)).toBe(true);
  });

  it("should clear all cached cells", function () {
    var cache = new CellMeasurerCache({
      fixedHeight: true,
      fixedWidth: true
    });
    cache.set(0, 0, 100, 20);
    cache.set(1, 0, 100, 20);
    expect(cache.has(0, 0)).toBe(true);
    expect(cache.has(1, 0)).toBe(true);
    cache.clearAll();
    expect(cache.has(0, 0)).toBe(false);
    expect(cache.has(1, 0)).toBe(false);
  });

  it("should support a custom :keyMapper", function () {
    var keyMapper = jest.fn();
    keyMapper.mockReturnValue("a");

    spyOn(console, "warn"); // Ignore warning about variable width and height

    var cache = new CellMeasurerCache({
      defaultHeight: 30,
      defaultWidth: 50,
      keyMapper: keyMapper
    });
    cache.set(0, 0, 100, 20);
    expect(cache.has(0, 0)).toBe(true);

    // Changing the returned key should cause cache misses
    keyMapper.mockReset();
    keyMapper.mockReturnValue("b");
    expect(cache.has(0, 0)).toBe(false);
    expect(cache.columnWidth(0)).toBe(50);
    expect(cache.rowHeight(0)).toBe(30);
    expect(keyMapper.mock.calls).toHaveLength(3);

    // Restoring it should fix
    keyMapper.mockReset();
    keyMapper.mockReturnValue("a");
    expect(cache.has(0, 0)).toBe(true);
    expect(cache.columnWidth(0)).toBe(100);
    expect(cache.rowHeight(0)).toBe(20);
    expect(keyMapper.mock.calls).toHaveLength(3);
  });

  it("should provide a Grid-compatible :columnWidth method", function () {
    var cache = new CellMeasurerCache({
      fixedHeight: true
    });
    expect(cache.columnWidth({ index: 0 })).toBe(DEFAULT_WIDTH);
    cache.set(0, 0, 100, 50);
    expect(cache.columnWidth({ index: 0 })).toBe(100);
    expect(cache.columnWidth({ index: 1 })).toBe(DEFAULT_WIDTH);
    cache.set(1, 0, 75, 50);
    expect(cache.columnWidth({ index: 0 })).toBe(100);
    cache.set(2, 0, 125, 50);
    expect(cache.columnWidth({ index: 0 })).toBe(125);
  });

  it("should provide a Grid-compatible :rowHeight method", function () {
    var cache = new CellMeasurerCache({
      fixedWidth: true
    });
    expect(cache.rowHeight({ index: 0 })).toBe(DEFAULT_HEIGHT);
    cache.set(0, 0, 100, 50);
    expect(cache.rowHeight({ index: 0 })).toBe(50);
    expect(cache.rowHeight({ index: 1 })).toBe(DEFAULT_HEIGHT);
    cache.set(0, 1, 100, 25);
    expect(cache.rowHeight({ index: 0 })).toBe(50);
    cache.set(0, 2, 100, 75);
    expect(cache.rowHeight({ index: 0 })).toBe(75);
  });

  it("should return the :defaultWidth for :columnWidth if not measured", function () {
    var cache = new CellMeasurerCache({
      defaultWidth: 25,
      fixedHeight: true,
      fixedWidth: true
    });
    expect(cache.columnWidth({ index: 0 })).toBe(25);
  });

  it("should return the :defaultHeight for :rowHeight if not measured", function () {
    var cache = new CellMeasurerCache({
      defaultHeight: 25,
      fixedHeight: true,
      fixedWidth: true
    });
    expect(cache.rowHeight({ index: 0 })).toBe(25);
  });

  it("should recalculate cached :columnWidth when cells are cleared", function () {
    var cache = new CellMeasurerCache({
      fixedHeight: true
    });
    expect(cache.columnWidth({ index: 0 })).toBe(DEFAULT_WIDTH);
    cache.set(0, 0, 125, 50);
    expect(cache.columnWidth({ index: 0 })).toBe(125);
    cache.set(1, 0, 150, 50);
    expect(cache.columnWidth({ index: 0 })).toBe(150);
    cache.clear(1, 0);
    expect(cache.columnWidth({ index: 0 })).toBe(125);
    cache.clear(0, 0);
    expect(cache.columnWidth({ index: 0 })).toBe(DEFAULT_WIDTH);
    cache.set(0, 0, 125, 50);
    expect(cache.columnWidth({ index: 0 })).toBe(125);
    cache.clearAll();
    expect(cache.columnWidth({ index: 0 })).toBe(DEFAULT_WIDTH);
  });

  it("should recalculate cached :rowHeight when cells are cleared", function () {
    var cache = new CellMeasurerCache({
      fixedWidth: true
    });
    expect(cache.rowHeight({ index: 0 })).toBe(DEFAULT_HEIGHT);
    cache.set(0, 0, 125, 50);
    expect(cache.rowHeight({ index: 0 })).toBe(50);
    cache.set(0, 1, 150, 75);
    expect(cache.rowHeight({ index: 0 })).toBe(75);
    cache.clear(0, 1);
    expect(cache.rowHeight({ index: 0 })).toBe(50);
    cache.clear(0, 0);
    expect(cache.rowHeight({ index: 0 })).toBe(DEFAULT_HEIGHT);
    cache.set(0, 0, 125, 50);
    expect(cache.rowHeight({ index: 0 })).toBe(50);
    cache.clearAll();
    expect(cache.rowHeight({ index: 0 })).toBe(DEFAULT_HEIGHT);
  });

  describe("DEV mode", function () {
    it("should warn about dynamic width and height configurations", function () {
      spyOn(console, "warn");

      var cache = new CellMeasurerCache({
        fixedHeight: false,
        fixedWidth: false
      });

      expect(cache.hasFixedHeight()).toBe(false);
      expect(cache.hasFixedWidth()).toBe(false);
      expect(console.warn).toHaveBeenCalledWith("CellMeasurerCache should only measure a cell's width or height. " + "You have configured CellMeasurerCache to measure both. " + "This will result in poor performance.");
    });

    it("should warn about dynamic width with a defaultWidth of 0", function () {
      spyOn(console, "warn");

      var cache = new CellMeasurerCache({
        defaultWidth: 0,
        fixedHeight: true
      });

      expect(cache.getWidth(0, 0)).toBe(0);
      expect(console.warn).toHaveBeenCalledWith("Fixed width CellMeasurerCache should specify a :defaultWidth greater than 0. " + "Failing to do so will lead to unnecessary layout and poor performance.");
    });

    it("should warn about dynamic height with a defaultHeight of 0", function () {
      spyOn(console, "warn");

      var cache = new CellMeasurerCache({
        defaultHeight: 0,
        fixedWidth: true
      });

      expect(cache.getHeight(0, 0)).toBe(0);
      expect(console.warn).toHaveBeenCalledWith("Fixed height CellMeasurerCache should specify a :defaultHeight greater than 0. " + "Failing to do so will lead to unnecessary layout and poor performance.");
    });
  });
});