const express = require("express")
const app = express()
const multer = require("multer") //upload file
const path = require("path") //memanggil path diktori
const fs = require("fs") //untuk manajemen file
const bodyParser = require("body-parser")
const cors = require("cors")
const mysql = require("mysql")
const moment = require("moment")

app.use(express.static(__dirname))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


// membuat variabel untuk konfigurasi proses upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // set file storage
        cb(null, './image')
    },
    fileName: (req, file, cb) => {
        // generate file name
        cb(null, "image-"+ Date.now() + path.extname(file.originalname))
    }
})

let upload = multer({storage: storage})

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "persewaan"
})

db.connect(error => {
    if(error){
        console.log(error.message)
    }else{
        console.log("MySQL Connected")
    }
})

// -------------------------------------- crud mobil -------------------------------------- //

app.get("/mobil", (req,res) => {
    let sql = "select * from mobil"

    db.query(sql, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                count: result.length,
                mobil: result
            }
        }
        res.json(response)
    })
})

app.get("/mobil/:id_mobil", (req,res) => {
    let data = {
        id_mobil : req.params.id_mobil
    }
    
    let sql = "select * from mobil where id_mobil"

    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                count: result.length,
                mobil: result
            }
        }
        res.json(response)
    })
})

app.post("/mobil", upload.single("image"), (req,res) => {
    // prepare data
    let data = {
        nomor_mobil: req.body.nomor_mobil,
        merk: req.body.merk,
        jenis: req.body.jenis,
        warna: req.body.warna,
        tahun_pembuatan: req.body.tahun_pembuatan,
        biaya_sewa_per_hari: Number(req.body.biaya_sewa_per_hari),
        image: req.file.filename
    }

    if(!req.file){
        // jika tidak ada file yang diupload
        res.json({
            message: "Tidak ada file yang dikirim"
        })
    } else {
        let sql = "insert into mobil set ?"

        db.query(sql, data, (error, result) => {
            if (error) throw error
            res.json({
                message: result.affectedRows + " data inserted"
            })
        })
    }
})

app.put("/mobil", upload.single("image"), (req,res) => {
    let data = null, sql = null
    let param = { id_mobil: req.body.id_mobil }

    if(!req.file){
        data = {
            nomor_mobil: req.body.nomor_mobil,
            merk: req.body.merk,
            jenis: req.body.jenis,
            warna: req.body.warna,
            tahun_pembuatan: req.body.tahun_pembuatan,
            biaya_sewa_per_hari: Number(req.body.biaya_sewa_per_hari)
        }
    } else {
        data = {
            nomor_mobil: req.body.nomor_mobil,
            merk: req.body.merk,
            jenis: req.body.jenis,
            warna: req.body.warna,
            tahun_pembuatan: req.body.tahun_pembuatan,
            biaya_sewa_per_hari: Number(req.body.biaya_sewa_per_hari),
            image: req.file.fileName
        }

        sql = "select * from mobil where ?"

        db.query(sql, param, (err, result) => {
            if(err) throw err
            let fileName = result[0].image

            let dir = path.join(__dirname,"image",fileName)
            fs.unlink(dir, (error) => {})
        })
    }

    sql = "update mobil set ? where ?"

    db.query(sql, [data,param], (error, result) => {
        if(error){
            res.json({
                message: error.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data updated"
            })
        }
    })
})

app.delete("/mobil/:id_mobil", (req,res) => {
    let param = { id_mobil: req.params.id_mobil }

    let sql = "select * from mobil where ?"

    db.query(sql, param, (error, result) => {
        if(error) throw error

        let fileName = result[0].image
        let dir = path.join(__dirname,"image",fileName)
        fs.unlink(dir, (error) => {})
    })

    sql = "delete from mobil where ?"

    db.query(sql, param, (error, result) => {
        if(error){ 
            res.json({
                message: error.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data deleted"
            })
        }
    })
})

// -------------------------------------- crud pelanggan -------------------------------------- //

app.get("/pelanggan", (req,res) => {
    let sql = "select * from pelanggan"

    db.query(sql, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                count: result.length,
                pelanggan: result
            }
        }
        res.json(response)
    })
})

app.get("/pelanggan/:id_pelanggan", (req,res) => {
    let data = {
        id_pelanggan : req.params.id_pelanggan
    }
    
    let sql = "select * from pelanggan where id_pelanggan"

    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                count: result.length,
                pelanggan: result
            }
        }
        res.json(response)
    })
})

app.post("/pelanggan", (req,res) => {
    let data = {
        nama_pelanggan: req.body.nama_pelanggan,
        alamat_pelanggan: req.body.alamat_pelanggan,
        kontak: req.body.kontak
    }
    
    let sql = "insert into pelanggan set ?"

    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data inserted"
            }
        }
        res.json(response)
    })
})

app.put("/pelanggan/:id_pelanggan", (req,res) => {
    let data = [
        {
            nama_pelanggan: req.body.nama_pelanggan,
            alamat_pelanggan: req.body.alamat_pelanggan,
            kontak: req.body.kontak
        },

        {
            id_pelanggan: req.params.id_pelanggan
        }
    ]
    let sql = "update pelanggan set ? where ?"

    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data updated   "
            }
        }
        res.json(response)
    })
})

app.delete("/pelanggan/:id_pelanggan", (req,res) => {
    let data = {
        id_pelanggan: req.params.id_pelanggan
    }
    
    let sql = "delete from pelanggan where ?"

    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data deleted"
            }
        }
        res.json(response)
    })
})

// -------------------------------------- crud karyawan -------------------------------------- //

app.get("/karyawan", (req,res) => {
    let sql = "select * from karyawan"

    db.query(sql, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                count: result.length,
                karyawan: result
            }
        }
        res.json(response)
    })
})

app.get("/karyawan/:id_karyawan", (req,res) => {
    let data = {
        id_karyawan : req.params.id_karyawan
    }
    
    let sql = "select * from karyawan where id_karyawan"

    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                count: result.length,
                karyawan: result
            }
        }
        res.json(response)
    })
})

app.post("/karyawan", (req,res) => {
    let data = {
        nama_karyawan: req.body.nama_karyawan,
        alamat_karyawan: req.body.alamat_karyawan,
        kontak: req.body.kontak,
        username: req.body.username,
        password: req.body.password
    }
    
    let sql = "insert into karyawan set ?"

    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data inserted"
            }
        }
        res.json(response)
    })
})

app.put("/karyawan/:id_karyawan", (req,res) => {
    let data = [
        {
            nama_karyawan: req.body.nama_karyawan,
            alamat_karyawan: req.body.alamat_karyawan,
            kontak: req.body.kontak,
            username: req.body.username,
            password: req.body.password
        },

        {
            id_karyawan: req.params.id_karyawan
        }
    ]
    let sql = "update karyawan set ? where ?"

    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data updated   "
            }
        }
        res.json(response)
    })
})

app.delete("/karyawan/:id_karyawan", (req,res) => {
    let data = {
        id_karyawan: req.params.id_karyawan
    }
    
    let sql = "delete from karyawan where ?"

    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data deleted"
            }
        }
        res.json(response)
    })
})

// -------------------------------------- transaksi persewaan -------------------------------------- //

app.post("/sewa", (req, res) => {
    let data = {
        id_mobil: req.body.id_mobil,
        id_karyawan: req.body.id_karyawan,
        id_pelanggan: req.body.id_pelanggan,
        tgl_sewa: moment().format('YYYY-MM-DD HH:mm:ss'),
        tgl_kembali: req.body.tgl_kembali,
        total_bayar: biaya_sewa_per_hari * (tgl_kembali - tgl_sewa)
    }

    let sewa = JSON.parse(req.body.sewa)

    let sql = "insert into sewa set ?"

    db.query(sql, data, (error, result) => {
        let response = null

        if(error){
            res.json({message: error.message})
        } else {
            let IDTerakhir = result.insertID

            let data = []
            for (let index = 0; index < sewa.length; index++){
                data.push([
                    IDTerakhir, sewa[index].id_sewa
                ])
            }

            let sql = "insert into sewa values ?"

            db.query(sql, [data], (error, result) => {
                if(error){
                    res.json({message: error.message})
                }else{
                    res.json({message: "Data has been inserted"})
                }
            })
        }
    })
})

app.get("/sewa", (req, res) => {
    let sql = "select * from s.id_sewa, s.id_pelanggan, p.nama_pelanggan, p.alamat_pelanggan, p.kontak, s.id_mobil, m.nomor_mobil, m.merk, m.jenis, m.warna, m,image, s.tgl_sewa, s.tgl_kembali, m.biaya_sewa_per_hari, s.total_bayar, k.nama_karyawan, k.kontak" +
    " from sewa s join pelanggan p on s.id_pelanggan = p.id_pelanggan" +
    " join karyawan k on p.id_karyawan = k.id_karyawan" +
    " join mobil m on p.id_mobil = m.id_mobil"

    db.query(sql, (error, result) => {
        if(error) {
            res.json({message: error.message})
        } else {
            res.json({
                count: result.length,
                penyewa: result
            })
        }
    })
})

app.delete("/sewa/:id_sewa", (req, res) => {
    let param = { id_sewa: req.params.id_siswa }

    let sql = "delete from sewa where ? "

    db.query(sql, param, (error, result) => {
        if(error){
            res.json({message: error.message})
        } else {
            res.json({message: "Data has been deleted"})
        }
    })
})

app.listen(14000, ()=> {
    console.log("Run on port 14000")
})