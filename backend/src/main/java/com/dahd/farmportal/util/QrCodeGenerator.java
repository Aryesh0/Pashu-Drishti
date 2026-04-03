 package com.dahd.farmportal.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

@Component
public class QrCodeGenerator {

    public String generateQrCodeBase64(String tagNumber) 
            throws WriterException, IOException {
        
        QRCodeWriter writer = new QRCodeWriter();
        
        BitMatrix matrix = writer.encode(
                tagNumber,
                BarcodeFormat.QR_CODE,
                300,
                300
        );

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", out);
        
        return Base64.getEncoder().encodeToString(out.toByteArray());
    }
}