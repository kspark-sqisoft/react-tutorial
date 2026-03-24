const ResponsiveGrid = () => {
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Item idx={1}>01</Item>
        <Item idx={2}>02</Item>
        <Item idx={3}>03</Item>
        <Item idx={4}>04</Item>
        <Item idx={5}>05</Item>
        <Item idx={6}>06</Item>
        <Item idx={7}>07</Item>
        <Item idx={8}>08</Item>
        <Item idx={9}>09</Item>
      </div>
    </div>
  );
};

export default ResponsiveGrid;

const Item = ({
  idx,
  children,
}: {
  idx: number;
  children: React.ReactNode;
}) => {
  if (idx === 5) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-blue-400 text-white text-xl font-bold h-24 col-span-2">
        {children}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center rounded-lg bg-pink-500 text-white text-xl font-bold h-24">
      {children}
    </div>
  );
};
