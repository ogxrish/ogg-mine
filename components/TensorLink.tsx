

export default function TensorLink() {
    return (
        <a
            href="/"
            target="_blank"
            className="px-3 text-sm justify-center items-center border-2 border-white py-3 flex gap-2 shadow-inner shadow-white"
            style={{
                // WebkitBoxShadow: "inset 0px 0px 169px 25px rgba(0,0,0,0.61)",
                // MozBoxShadow: " inset 0px 0px 169px 25px rgba(0,0,0,0.61)",
                boxShadow: "inset 0px 0px 60px 0px rgba(0,0,0,0.5)",
            }}
        >
            <img
                src="/tensor.svg"
                className="border rounded-full"
                alt=""
                width={35}
                height={35}
            />
            Tensor
        </a>
    );
}