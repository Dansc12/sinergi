import React, { useEffect, useRef } from "react";
import Quagga from "quagga";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected, onClose }) => {
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scannerRef.current) {
      Quagga.init(
        {
          inputStream: {
            type: "LiveStream",
            target: scannerRef.current,
            constraints: {
              facingMode: "environment",
            },
          },
          locator: { patchSize: "medium", halfSample: true },
          numOfWorkers: navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4,
          decoder: {
            readers: ["ean_reader", "upc_reader", "code_128_reader"],
          },
        },
        (err) => {
          if (err) {
            console.error("Quagga init error:", err);
            Quagga.stop();
          } else {
            Quagga.start();
          }
        },
      );

      Quagga.onDetected(handleDetected);
    }

    function handleDetected(result: any) {
      const code = result.codeResult.code;
      onDetected(code);
      Quagga.stop();
    }

    return () => {
      Quagga.offDetected(handleDetected);
      Quagga.stop();
    };
  }, []);

  return (
    <div
      ref={scannerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#222",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 2,
          background: "transparent",
          border: "none",
          borderRadius: "50%",
          width: 40,
          height: 40,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          boxShadow: "0 1px 6px #2228",
          cursor: "pointer",
        }}
        onClick={() => {
          Quagga.stop();
          onClose();
        }}
        aria-label="Close"
      >
        &#10005;
      </button>
    </div>
  );
};
export default BarcodeScanner;
