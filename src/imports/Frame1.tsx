import imgImage1 from "figma:asset/0f81bf73f9c6ae4da10dc087bea2650bdda8d752.png";

export default function Frame() {
  return (
    <div className="relative size-full">
      <div className="absolute h-[1158px] left-0 top-0 w-[1448px]" data-name="image 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[116.49%] left-0 max-w-none top-[-6.3%] w-full" src={imgImage1} />
        </div>
      </div>
    </div>
  );
}