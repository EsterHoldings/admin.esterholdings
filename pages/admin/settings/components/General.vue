<template>
  <div class="cards-container">
    <div v-for="(row, index) in tableData" :key="index" class="card">
      <div class="card__logo">
        <img v-if="row.previewUrl" :src="row.previewUrl" alt="Logo" class="preview-image" />
        <UiIconLogo v-else class="logo-placeholder" />
      </div>

      <div class="card__upload">
        <label class="upload-button">
          <UiIconLoad />
          <UiTextH4> Upload </UiTextH4>
          <input type="file" accept="image/*" @change="handleFileChange($event, index)" />
        </label>
      </div>

      <UiIconTrash @click="removeFile(index)" class="delete-icon" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios"; // Используем axios для запросов
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
import UiIconLoad from "~/components/ui/UiIconLoad.vue";
import UiIconTrash from "~/components/ui/UiIconTrash.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";

const tableData = ref([{ id: 1, previewUrl: null, file: null }]);

const appCore = useAppCore();

const handleFileChange = async (event, index) => {
  const selectedFile = event.target.files[0];

  if (!selectedFile) return;

  try {
    // const { data } = await axios.post("/api/admin/get-pre-signed-url", {
    //   fileName: selectedFile.name,
    //   fileType: selectedFile.type,
    // });

    const response = await appCore.s3.getPreSignedUrl({
      fileName: selectedFile.name,
      fileType: selectedFile.type,
    });
    console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
    console.log(response.data);
    console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
    const presignedUrl = response.data.url;
    const s3FileUrl = response.data.key;

    await axios.put(presignedUrl, selectedFile, {
      headers: {
        "Content-Type": selectedFile.type,
      },
    });

    const responseTempViewLink = await appCore.s3.getTempViewUrl({
      fileKey: s3FileUrl
    });

    tableData.value[index].file = selectedFile;
    tableData.value[index].previewUrl = responseTempViewLink.data.url;
  } catch (error) {
    console.error("Ошибка при загрузке файла:", error);
  }
};

const removeFile = (index) => {
  tableData.value[index].file = null;
  tableData.value[index].previewUrl = null;
};
</script>

<style scoped lang="scss">
.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.card {
  position: relative;
  border-radius: 25px;
  padding: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 15px;
  width: 100%;
  border: 1px solid var(--color-stroke-ui-dark);
  transition: .5s;

  &:hover {
    box-shadow: 0 16px 50px rgb(247 87 9 / 10%);
    transition: .3s;
  }
}

.card__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
  width: 150px;
}

.card__upload {
  width: 100%;
}

.preview-image {
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
}

.logo-placeholder {
  width: 100px;
  height: 100px;
  background: var(--color-ui-text);
  //border-radius: 50%;
}

.upload-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s;
  border: 2px dashed var(--color-ui-primary);
  width: 100%;
  text-align: center;
  height: 200px;

  &:hover {
    background: rgba(0, 0, 0, 0.05);

    svg {
      transform: scale(1.1);
      transition: transform 0.3s ease-in-out;
    }
  }

  input {
    display: none;
  }
}

.delete-icon {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  color: red;

  position: absolute;
  top: -13px;
  right: -13px;

  &:hover {
    transform: scale(1.1);
  }
}
</style>