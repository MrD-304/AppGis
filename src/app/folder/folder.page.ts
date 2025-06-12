import { Component, inject, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GeolocationService } from 'src/services/geolocation.services';
import * as L from 'leaflet';
import searchResultsType from 'src/types/searchResults.type';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  standalone: false,
})
export class FolderPage implements OnInit, OnDestroy, AfterViewInit {
  public folder!: string;
  private activatedRoute = inject(ActivatedRoute);
  private map: any;
  private mapInitialized = false;
  public currentLocation: any;

  // Thông tin nhóm và app
  public appInfo = {
    name: 'GIS Mobile App',
    description: 'Ứng dụng bản đồ chuyên đề sử dụng Ionic Angular',
    version: '1.0.0'
  };

  public teamInfo = {
    groupName: 'Nhóm 9',
    className: 'DH22HM',
    major: 'Hệ thống thông tin địa lý',
    members: [
      'Đinh Trúc Vân: 22166102',
      'Nguyễn Quỳnh Nhi: 22166065',
      'Hồ Võ Minh Trường: 22166093',
      'Nguyễn Minh Phú: 22166069',
      'Trần Xuân Trường: 22166095',
      'Nguyễn Hoàng Minh Tuấn: 22166098',
      'Nguyễn Đức Trọng: 22166091',
      'Trần Dương Vinh: 22166103',
    ]
  };

  // Dữ liệu bản đồ chuyên đề mở rộng
  public thematicLayers = [
    {
      name: 'Trường Đại học',
      description: 'Các trường đại học tại TP.HCM',
      data: [
        { name: 'ĐH Bách Khoa', lat: 10.7721, lng: 106.6576, info: 'Đại học Bách khoa TP.HCM - Trường kỹ thuật hàng đầu' },
        { name: 'ĐH Khoa học Tự nhiên', lat: 10.7626, lng: 106.6824, info: 'Đại học Khoa học Tự nhiên - ĐH Quốc gia' },
        { name: 'ĐH Kinh tế', lat: 10.7308, lng: 106.6941, info: 'Đại học Kinh tế TP.HCM' },
        { name: 'ĐH Công nghệ Thông tin', lat: 10.7307, lng: 106.6945, info: 'Đại học Công nghệ Thông tin - ĐH Quốc gia' },
        { name: 'ĐH Y Dược', lat: 10.7543, lng: 106.6666, info: 'Đại học Y Dược TP.HCM' },
        { name: 'ĐH Sư phạm', lat: 10.7626, lng: 106.6824, info: 'Đại học Sư phạm TP.HCM' }
      ]
    },
    {
      name: 'Bệnh viện',
      description: 'Các bệnh viện lớn tại TP.HCM',
      data: [
        { name: 'BV Chợ Rẫy', lat: 10.7542, lng: 106.6665, info: 'Bệnh viện Chợ Rẫy - Bệnh viện hạng đặc biệt' },
        { name: 'BV Bình Dan', lat: 10.7507, lng: 106.6647, info: 'Bệnh viện Bình Dan - Bệnh viện đa khoa' },
        { name: 'BV 115', lat: 10.7825, lng: 106.6958, info: 'Bệnh viện 115 - Cấp cứu 24/7' },
        { name: 'BV Từ Dũ', lat: 10.7690, lng: 106.6910, info: 'Bệnh viện Từ Dũ - Chuyên khoa Phụ sản' },
        { name: 'BV Nhi Đồng 1', lat: 10.7691, lng: 106.6945, info: 'Bệnh viện Nhi Đồng 1 - Chuyên khoa Nhi' },
        { name: 'BV Thống Nhất', lat: 10.7908, lng: 106.6877, info: 'Bệnh viện Thống Nhất - Bệnh viện đa khoa' }
      ]
    },
    {
      name: 'Trung tâm Thương mại',
      description: 'Các trung tâm thương mại lớn tại TP.HCM',
      data: [
        { name: 'Saigon Centre', lat: 10.7797, lng: 106.7010, info: 'Trung tâm thương mại Saigon Centre' },
        { name: 'Vincom Center', lat: 10.7769, lng: 106.7009, info: 'Vincom Center - TTTM cao cấp' },
        { name: 'Diamond Plaza', lat: 10.7826, lng: 106.7019, info: 'Diamond Plaza - TTTM trung tâm' },
        { name: 'Bitexco Financial Tower', lat: 10.7719, lng: 106.7037, info: 'Bitexco Financial Tower - Tòa nhà cao nhất' }
      ]
    }
  ];

  public searchResults: searchResultsType[] = []


  constructor(
    private geolocationService: GeolocationService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
  }

  ngAfterViewInit() {
    // Khởi tạo map sau khi view đã render hoàn toàn
    if (this.folder === 'explore') {
      // Giảm delay để load nhanh hơn
      setTimeout(() => {
        this.initializeMap();
      }, 50);
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.mapInitialized = false;
    }
  }


  async getCurrentLocation() {
    try {
      this.currentLocation = await this.geolocationService.getCurrentPosition();
      if (this.map && this.currentLocation) {
        // Thêm marker vị trí hiện tại lên bản đồ
        const userMarker = L.marker([this.currentLocation.latitude, this.currentLocation.longitude])
          .addTo(this.map)
          .bindPopup(`
            <div>
              <h4>Vị trí hiện tại</h4>
              <p>Lat: ${this.currentLocation.latitude.toFixed(6)}</p>
              <p>Lng: ${this.currentLocation.longitude.toFixed(6)}</p>
              <p>Độ chính xác: ${this.currentLocation.accuracy}m</p>
            </div>
          `);

        // Di chuyển bản đồ đến vị trí hiện tại
        this.map.setView([this.currentLocation.latitude, this.currentLocation.longitude], 15);
      }
    } catch (error) {
      console.error('Lỗi khi lấy vị trí:', error);
      alert('Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập vị trí.');
    }
  }

  private initializeMap() {
    // Kiểm tra nếu map đã được khởi tạo
    if (this.mapInitialized) {
      return;
    }

    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Map element not found');
      // Thử lại sau 500ms
      setTimeout(() => {
        this.initializeMap();
      }, 500);
      return;
    }

    try {
      console.log('Initializing map...');

      // Khởi tạo bản đồ với cấu hình tối ưu
      this.map = L.map('map', {
        center: [10.762622, 106.660172],
        zoom: 12,
        scrollWheelZoom: true,
        touchZoom: true,
        doubleClickZoom: true,
        boxZoom: false,
        preferCanvas: false, // Đổi về SVG để ổn định hơn
        zoomControl: true,
        attributionControl: true
      });

      // Sử dụng OpenStreetMap làm layer chính (load nhanh nhất)
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
        minZoom: 10,
        detectRetina: false // Tắt để load nhanh hơn
      });

      // Các layer Google Maps
      const googleSat = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '© Google',
        maxZoom: 18,
        minZoom: 10
      });

      const googleStreets = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        attribution: '© Google',
        maxZoom: 18,
        minZoom: 10
      });

      // Thêm layer mặc định ngay lập tức
      osmLayer.addTo(this.map);

      // Control layers
      const baseMaps = {
        "OpenStreetMap": osmLayer,
        "Google Streets": googleStreets,
        "Google Satellite": googleSat
      };

      L.control.layers(baseMaps, undefined, {
        collapsed: true,
        position: 'topright'
      }).addTo(this.map);

      // Event khi map đã sẵn sàng
      this.map.whenReady(() => {
        console.log('Map is ready');

        // Fix kích thước
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
            console.log('Map size invalidated');
          }
        }, 100);

        // Thêm các điểm dữ liệu chuyên đề NGAY KHI MAP READY
        setTimeout(() => {
          this.addThematicLayers();
          console.log('Thematic layers added');
        }, 200);
      });

      this.mapInitialized = true;
      console.log('Map initialization completed');

    } catch (error) {
      console.error('Error initializing map:', error);
      // Thử lại sau 1 giây
      setTimeout(() => {
        this.mapInitialized = false;
        this.initializeMap();
      }, 1000);
    }
  }

  private addThematicLayers() {
    if (!this.map) {
      console.error('Map not initialized for thematic layers');
      return;
    }

    try {
      // Tạo các icon khác nhau cho từng loại với style rõ ràng
      const universityIcon = L.divIcon({
        className: 'custom-icon university-icon',
        html: '<div style="background: #4285f4; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">🎓</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const hospitalIcon = L.divIcon({
        className: 'custom-icon hospital-icon',
        html: '<div style="background: #ea4335; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">🏥</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const shoppingIcon = L.divIcon({
        className: 'custom-icon shopping-icon',
        html: '<div style="background: #34a853; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">🛍️</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      // Tạo layer groups để quản lý
      const universityGroup = L.layerGroup();
      const hospitalGroup = L.layerGroup();
      const shoppingGroup = L.layerGroup();

      // Thêm layer trường đại học
      this.thematicLayers[0].data.forEach((point, index) => {
        const marker = L.marker([point.lat, point.lng], { icon: universityIcon })
          .bindPopup(`
            <div style="padding: 10px;">
              <h4 style="margin: 0 0 8px 0; color: #4285f4;">${point.name}</h4>
              <p style="margin: 4px 0;">${point.info}</p>
              <p style="margin: 4px 0;"><strong>Loại:</strong> Trường Đại học</p>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">Lat: ${point.lat}, Lng: ${point.lng}</p>
            </div>
          `);

        marker.addTo(universityGroup);
        marker.addTo(this.map); // Thêm trực tiếp vào map
      });

      // Thêm layer bệnh viện
      this.thematicLayers[1].data.forEach((point, index) => {
        const marker = L.marker([point.lat, point.lng], { icon: hospitalIcon })
          .bindPopup(`
            <div style="padding: 10px;">
              <h4 style="margin: 0 0 8px 0; color: #ea4335;">${point.name}</h4>
              <p style="margin: 4px 0;">${point.info}</p>
              <p style="margin: 4px 0;"><strong>Loại:</strong> Bệnh viện</p>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">Lat: ${point.lat}, Lng: ${point.lng}</p>
            </div>
          `);

        marker.addTo(hospitalGroup);
        marker.addTo(this.map); // Thêm trực tiếp vào map
      });

      // Thêm layer trung tâm thương mại
      this.thematicLayers[2].data.forEach((point, index) => {
        console.log(`Adding shopping center ${index + 1}: ${point.name}`);
        const marker = L.marker([point.lat, point.lng], { icon: shoppingIcon })
          .bindPopup(`
            <div style="padding: 10px;">
              <h4 style="margin: 0 0 8px 0; color: #34a853;">${point.name}</h4>
              <p style="margin: 4px 0;">${point.info}</p>
              <p style="margin: 4px 0;"><strong>Loại:</strong> Trung tâm Thương mại</p>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">Lat: ${point.lat}, Lng: ${point.lng}</p>
            </div>
          `);

        marker.addTo(shoppingGroup);
        marker.addTo(this.map); // Thêm trực tiếp vào map
      });

      // Thêm overlay controls để có thể toggle on/off
      const overlayMaps = {
        "🎓 Trường Đại học": universityGroup,
        "🏥 Bệnh viện": hospitalGroup,
        "🛍️ Trung tâm TM": shoppingGroup
      };

      // Xóa control cũ nếu có
      this.map.eachLayer((layer: any) => {
        if (layer instanceof L.Control.Layers) {
          this.map.removeControl(layer);
        }
      });

      // // Thêm control mới
      L.control.layers(undefined, overlayMaps, {
        collapsed: false, // Mở rộng để dễ thấy
        position: 'topright'
      }).addTo(this.map);

      // Thêm các group vào map
      universityGroup.addTo(this.map);
      hospitalGroup.addTo(this.map);
      shoppingGroup.addTo(this.map);

      // Fit map bounds để hiển thị tất cả markers
      const allPoints = [
        ...this.thematicLayers[0].data.map(p => [p.lat, p.lng]),
        ...this.thematicLayers[1].data.map(p => [p.lat, p.lng]),
        ...this.thematicLayers[2].data.map(p => [p.lat, p.lng])
      ];

      if (allPoints.length > 0) {
        const group = L.featureGroup(
          allPoints.map(point => L.marker(point as [number, number]))
        );
        this.map.fitBounds(group.getBounds().pad(0.1));
      }

    } catch (error) {
      console.error('Error adding thematic layers:', error);
    }
  }

  getPageTitle(): string {
    switch (this.folder) {
      case 'home': return 'Trang chủ';
      case 'about': return 'Giới thiệu';
      case 'explore': return 'Khám phá bản đồ';
      case 'contact': return 'Liên hệ';
      default: return this.folder;
    }
  }

  onSearch(event: any) {
    const query = event.target.value;
    if (!query || query.trim() === '') {
      this.searchResults = [];
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;
    this.http.get(url).subscribe((results: any) => {
      this.searchResults = results; // Cập nhật danh sách kết quả
    });
  }

  selectSearchResult(result: any) {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    // Thêm marker tại vị trí đã chọn
    L.marker([lat, lon])
      .addTo(this.map!)
      .bindPopup(`<strong>${result.display_name}</strong>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">Lat: ${lat}, Lng: ${lon}</p>`)
      .openPopup();

    // Di chuyển bản đồ đến vị trí đã chọn
    if (this.map) {
      this.map.setView([lat, lon], 13);
    }

    // Xóa danh sách kết quả
    this.searchResults = [];
  }
}

